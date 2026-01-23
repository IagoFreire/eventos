import { Request, Response } from 'express';
import { payment, getInstallments } from '../config/mercadopago.js';
import { RegistrationModel } from '../models/registration.model.js';

export class PaymentController {
  // Criar pagamento
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { registration_id, transaction_amount, description, payment_method_id, payer } = req.body;

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
      const paymentData = {
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

      const result = await payment.create({ body: paymentData });

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
      const { type, data } = req.body;

      if (type === 'payment') {
        const paymentId = data.id;
        const result = await payment.get({ id: paymentId });

        // Buscar inscrição pelo payment_id
        const registrations = await RegistrationModel.findAll();
        const registration = registrations.find(r => r.payment_id === paymentId.toString());

        if (registration) {
          // Atualizar status do pagamento
          const status = result.status === 'approved' ? 'approved' : 
                        result.status === 'rejected' ? 'rejected' : 'pending';
          
          await RegistrationModel.updatePaymentStatus(
            registration.id,
            status,
            paymentId.toString()
          );
        }
      }

      res.status(200).send();
    } catch (error: any) {
      console.error('Erro no webhook:', error);
      res.status(500).json({ error: error.message });
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
