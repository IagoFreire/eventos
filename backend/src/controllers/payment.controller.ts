import { Request, Response } from 'express';
import { payment, getInstallments } from '../config/mercadopago.js';
import { RegistrationModel } from '../models/registration.model.js';
import crypto from 'crypto';

export class PaymentController {
  // Criar pagamento
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        registration_id,
        transaction_amount,
        description,
        payment_method_id,
        payer,
        token, // Token do cartão (para pagamentos com cartão)
        installments, // Número de parcelas
        issuer_id, // ID do banco emissor (opcional)
      } = req.body;

      // Verificar se a inscrição existe
      const registration = await RegistrationModel.findById(registration_id);
      if (!registration) {
        res.status(404).json({ error: 'Inscrição não encontrada' });
        return;
      }

      // Limpar e validar CPF
      let cpfNumber = payer.identification.number.replace(/\D/g, '');

      // Se CPF não tiver 11 dígitos ou for inválido, usar CPF de teste do Mercado Pago
      if (cpfNumber.length !== 11) {
        console.log('⚠️ CPF inválido, usando CPF de teste: 12345678909');
        cpfNumber = '12345678909'; // CPF de teste oficial do Mercado Pago
      }

      // Verificar se o token do Mercado Pago está configurado
      if (!process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN === 'TEST-ACCESS-TOKEN') {
        // Retornar sucesso simulado se o Mercado Pago não estiver configurado
        const simulatedPaymentId = 'SIMULATED-' + Date.now();
        await RegistrationModel.updatePaymentStatus(
          registration.id,
          'approved',
          simulatedPaymentId,
          payment_method_id, // Salvar método de pagamento
          parseFloat(transaction_amount) // Salvar valor
        );

        res.status(201).json({
          payment_id: simulatedPaymentId,
          status: 'approved',
          status_detail: 'accredited',
          message: 'Pagamento simulado (Mercado Pago não configurado)'
        });
        return;
      }

      // Criar pagamento no Mercado Pago (nova sintaxe SDK 2.x)
      // Construir URL do webhook - Mercado Pago requer URL pública com HTTPS
      // Não enviar notification_url em desenvolvimento local (localhost)
      let webhookUrl: string | undefined;

      if (process.env.WEBHOOK_URL) {
        webhookUrl = process.env.WEBHOOK_URL;
      } else if (process.env.BACKEND_URL) {
        const backendUrl = process.env.BACKEND_URL.replace(/\/$/, '');
        webhookUrl = `${backendUrl}/api/payments/webhook`;
      }

      // Validar se a URL é válida (deve ser HTTPS e não localhost)
      const isValidWebhookUrl = webhookUrl &&
        webhookUrl.startsWith('https://') &&
        !webhookUrl.includes('localhost') &&
        !webhookUrl.includes('127.0.0.1');

      if (webhookUrl && isValidWebhookUrl) {
        console.log(`🔗 URL do webhook configurada: ${webhookUrl}`);
      } else if (webhookUrl) {
        console.warn(`⚠️ URL do webhook inválida (deve ser HTTPS público): ${webhookUrl}`);
        console.warn('⚠️ notification_url não será enviada. Configure WEBHOOK_URL com uma URL pública HTTPS.');
        webhookUrl = undefined; // Não enviar URL inválida
      } else {
        console.log('ℹ️ WEBHOOK_URL não configurado. Webhook será configurado no painel do Mercado Pago.');
      }

      const paymentData: any = {
        transaction_amount: parseFloat(transaction_amount), // Garantir que seja número
        description,
        payment_method_id,
        payer: {
          email: payer.email,
          identification: {
            type: payer.identification.type,
            number: cpfNumber, // Usar CPF limpo e validado
          },
        },
        metadata: {
          registration_id: registration.id,
        },
      };

      // Se for cartão de crédito, adicionar token e parcelas
      // Aceita 'credit_card' (genérico) ou tipos específicos (visa, master, amex, etc.)
      const isCreditCard = payment_method_id === 'credit_card' ||
        ['visa', 'master', 'amex', 'elo', 'hipercard', 'diners'].includes(payment_method_id);

      if (isCreditCard) {
        if (!token) {
          res.status(400).json({ error: 'Token do cartão é obrigatório para pagamentos com cartão' });
          return;
        }

        paymentData.token = token;
        paymentData.installments = installments || 1;

        // Adicionar issuer_id se fornecido
        if (issuer_id) {
          paymentData.issuer_id = issuer_id;
        }

        console.log('💳 Processando pagamento com cartão:', {
          payment_method_id,
          installments: paymentData.installments,
          has_token: !!token,
        });
      }

      // Adicionar notification_url APENAS para PIX que precisa de confirmação automática
      // Cartão de crédito retorna status imediatamente, não precisa de webhook
      // Só adicionar se a URL for válida (HTTPS público)
      if (payment_method_id === 'pix' && webhookUrl && isValidWebhookUrl) {
        paymentData.notification_url = webhookUrl;
        console.log(`📡 notification_url configurada para PIX: ${webhookUrl}`);
      } else if (payment_method_id === 'pix') {
        console.log('ℹ️ notification_url não configurada para PIX (use WEBHOOK_URL com URL pública HTTPS)');
        console.log('ℹ️ Configure o webhook no painel do Mercado Pago ou use ngrok para desenvolvimento');
      } else if (isCreditCard) {
        console.log('💳 Cartão de crédito: webhook desabilitado (status retornado imediatamente)');
      }

      console.log('💳 Criando pagamento no Mercado Pago:', {
        payment_method_id,
        transaction_amount: paymentData.transaction_amount,
        notification_url: paymentData.notification_url || 'não configurada',
      });

      const result = await payment.create({ body: paymentData });

      console.log('✅ Pagamento criado no Mercado Pago:', {
        payment_id: result.id,
        status: result.status,
        payment_method_id: result.payment_method_id,
      });

      // Atualizar inscrição com o ID do pagamento e informações completas
      await RegistrationModel.updatePaymentStatus(
        registration.id,
        result.status === 'approved' ? 'approved' : 'pending',
        result.id?.toString(),
        payment_method_id, // Salvar método de pagamento
        parseFloat(transaction_amount) // Salvar valor
      );

      // Preparar resposta com informações do PIX (se aplicável)
      const response: any = {
        payment_id: result.id,
        status: result.status,
        status_detail: result.status_detail,
      };

      // Se for PIX, incluir informações do QR Code
      if (payment_method_id === 'pix' && result.point_of_interaction) {
        response.pix = {
          qr_code: result.point_of_interaction.transaction_data?.qr_code,
          qr_code_base64: result.point_of_interaction.transaction_data?.qr_code_base64,
          ticket_url: result.point_of_interaction.transaction_data?.ticket_url,
        };
      }

      res.status(201).json(response);
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar status do pagamento
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Se for pagamento simulado
      if (id.startsWith('SIMULATED-')) {
        res.json({
          payment_id: id,
          status: 'approved',
          status_detail: 'accredited',
        });
        return;
      }

      const result = await payment.get({ id });

      res.json({
        payment_id: result.id,
        status: result.status,
        status_detail: result.status_detail,
      });
    } catch (error: any) {
      console.error('Erro ao buscar pagamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Webhook para receber notificações do Mercado Pago
  static async webhook(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔔 Webhook recebido:', {
        method: req.method,
        url: req.url,
        headers: {
          'x-signature': req.headers['x-signature'] ? 'presente' : 'ausente',
          'x-request-id': req.headers['x-request-id'] || 'ausente',
        },
        query: req.query,
        body: req.body,
      });

      // Validar assinatura do webhook (se configurado)
      if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
        const isValid = PaymentController.validateWebhookSignature(req);
        if (!isValid) {
          console.error('⚠️ Webhook inválido: assinatura não confere');
          // Em modo de desenvolvimento, logar mas não bloquear
          if (process.env.NODE_ENV === 'production') {
            res.status(401).json({ error: 'Assinatura inválida' });
            return;
          } else {
            console.warn('⚠️ Assinatura inválida, mas continuando em modo desenvolvimento');
          }
        } else {
          console.log('✅ Assinatura do webhook validada com sucesso');
        }
      } else {
        console.log('ℹ️ Validação de assinatura desabilitada (MERCADOPAGO_WEBHOOK_SECRET não configurado)');
      }

      // Mercado Pago pode enviar webhook de duas formas:
      // 1. POST com body { type: 'payment', data: { id: '123' } }
      // 2. GET com query ?data.id=123&type=payment
      let paymentId: string | undefined;
      let notificationType: string | undefined;

      if (req.method === 'POST' && req.body) {
        notificationType = req.body.type;
        paymentId = req.body.data?.id;
      } else if (req.method === 'GET' && req.query) {
        notificationType = req.query.type as string;
        paymentId = req.query['data.id'] as string;
      }

      if (notificationType === 'payment' && paymentId) {
        console.log(`🔔 Processando notificação de pagamento: ${paymentId}`);

        // Buscar inscrição primeiro para verificar se existe
        const registration = await RegistrationModel.findByPaymentId(paymentId.toString());

        if (!registration) {
          console.warn(`⚠️ Inscrição não encontrada para payment_id: ${paymentId}`);
          res.status(200).send('OK');
          return;
        }

        // Verificar se é um webhook de teste (sem assinatura válida ou em desenvolvimento)
        const isTestWebhook = !process.env.MERCADOPAGO_WEBHOOK_SECRET ||
          process.env.NODE_ENV !== 'production' ||
          !req.headers['x-signature'];

        let status: string;

        if (isTestWebhook) {
          // Em modo de teste, se o webhook foi chamado, assumir que foi aprovado
          console.log('🧪 Modo de teste: Webhook chamado, atualizando para approved');
          status = 'approved';
        } else {
          // Em produção, consultar status real no Mercado Pago
          const result = await payment.get({ id: paymentId });
          console.log(`📊 Status do pagamento ${paymentId} no Mercado Pago: ${result.status}`);

          status = result.status === 'approved' ? 'approved' :
            result.status === 'rejected' ? 'rejected' : 'pending';
        }

        // Atualizar status do pagamento
        await RegistrationModel.updatePaymentStatus(
          registration.id,
          status,
          paymentId.toString()
        );

        console.log(`✅ Status da inscrição ${registration.id} atualizado para: ${status}`);
      } else {
        console.log(`ℹ️ Tipo de notificação não processado: ${notificationType || 'desconhecido'}`);
      }

      res.status(200).send('OK');
    } catch (error: any) {
      console.error('❌ Erro no webhook:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({ error: error.message });
    }
  }

  // Validar assinatura do webhook do Mercado Pago
  private static validateWebhookSignature(req: Request): boolean {
    try {
      // const crypto = require('crypto'); // Removido: usando import
      const xSignature = req.headers['x-signature'] as string;
      const xRequestId = req.headers['x-request-id'] as string;
      const dataId = req.query['data.id'] as string;
      const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

      if (!xSignature || !xRequestId || !dataId || !secret) {
        return false;
      }

      const parts = xSignature.split(',');
      const ts = parts[0]?.split('=')[1];
      const hash = parts[1]?.split('=')[1];

      if (!ts || !hash) {
        return false;
      }

      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(manifest);
      const sha = hmac.digest('hex');

      return sha === hash;
    } catch (error) {
      console.error('Erro ao validar assinatura do webhook:', error);
      return false;
    }
  }

  // Buscar opções de parcelamento
  static async getInstallments(req: Request, res: Response): Promise<void> {
    try {
      const { amount, payment_method_id } = req.query;

      if (!amount) {
        res.status(400).json({ error: 'Valor (amount) é obrigatório' });
        return;
      }

      const installmentsData = await getInstallments(
        parseFloat(amount as string),
        (payment_method_id as string) || 'credit_card'
      );

      res.json(installmentsData);
    } catch (error: any) {
      console.error('Erro ao buscar parcelamento:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
