/**
 * Componente de pagamento com cartão de crédito
 * 
 * Usa o SDK React oficial do Mercado Pago com CardPayment Brick
 * - Carregamento rápido e otimizado
 * - UI oficial do Mercado Pago
 * - Validação e tokenização automáticas
 */
import React, { useState, useMemo, useRef, useCallback, memo, useEffect } from 'react';
import { CardPayment } from '@mercadopago/sdk-react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../services/apiSelector';
import { formatPrice } from '../utils/formatPrice';
import { publicKey } from '../services/mercadopago-config';

interface CreditCardPaymentProps {
  amount: number;
  registrationId: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
  payerEmail?: string;
  payerCpf?: string;
}

// Tradução de motivos de rejeição do Mercado Pago (constante fora do componente)
const REJECTION_REASONS: Record<string, string> = {
  'cc_rejected_bad_filled_card_number': 'Número do cartão inválido',
  'cc_rejected_bad_filled_date': 'Data de validade inválida',
  'cc_rejected_bad_filled_other': 'Verifique os dados do cartão',
  'cc_rejected_bad_filled_security_code': 'Código de segurança inválido',
  'cc_rejected_blacklist': 'Cartão não autorizado',
  'cc_rejected_call_for_authorize': 'Entre em contato com o banco emissor',
  'cc_rejected_card_disabled': 'Cartão desabilitado',
  'cc_rejected_duplicated_payment': 'Pagamento duplicado',
  'cc_rejected_high_risk': 'Pagamento recusado por segurança',
  'cc_rejected_insufficient_amount': 'Saldo insuficiente',
  'cc_rejected_invalid_installments': 'Número de parcelas inválido',
  'cc_rejected_max_attempts': 'Número máximo de tentativas excedido',
  'cc_rejected_other_reason': 'Pagamento recusado. Verifique os dados ou tente outro cartão',
};

// Componente isolado do CardPayment para evitar recarregamento
const CardPaymentWrapper = memo(({ 
  initialization, 
  onSubmit, 
  onReady, 
  onError, 
  customization 
}: {
  initialization: any;
  onSubmit: (formData: any) => Promise<void>;
  onReady: () => void;
  onError: (error: any) => void;
  customization: any;
}) => {
  return (
    <CardPayment
      initialization={initialization}
      onSubmit={onSubmit}
      onReady={onReady}
      onError={onError}
      customization={customization}
    />
  );
}, (prevProps, nextProps) => {
  // Comparação customizada: só re-renderizar se initialization mudar
  return (
    prevProps.initialization.amount === nextProps.initialization.amount &&
    prevProps.initialization.payer.email === nextProps.initialization.payer.email &&
    prevProps.initialization.payer.identification.number === nextProps.initialization.payer.identification.number
  );
});

const CreditCardPayment: React.FC<CreditCardPaymentProps> = ({
  amount,
  registrationId,
  onPaymentSuccess,
  onCancel,
  payerEmail,
  payerCpf,
}) => {
  const [cardPaymentKey, setCardPaymentKey] = useState(`card-payment-${registrationId}`);
  const isSubmittingRef = useRef(false);
  const paymentSuccessTriggeredRef = useRef(false);
  
  // Função helper para resetar estados após erro/rejeição
  const resetPaymentState = useCallback(() => {
    isSubmittingRef.current = false;
    setCardPaymentKey(`card-payment-${registrationId}-${Date.now()}`);
  }, [registrationId]);

  // Verificar se a chave pública está configurada
  if (!publicKey || publicKey === 'your_mercado_pago_public_key' || publicKey.includes('xxxxxxxx')) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold mb-2">
                ⚠️ Configuração Necessária
              </p>
              <p className="text-red-700 text-sm mb-3">
                A chave pública do Mercado Pago não está configurada.
              </p>
              <p className="text-red-700 text-sm mb-2">
                Para configurar:
              </p>
              <ol className="text-red-700 text-sm list-decimal list-inside space-y-1">
                <li>Crie um arquivo <code className="bg-red-100 px-1 rounded">.env</code> na raiz do projeto</li>
                <li>Adicione: <code className="bg-red-100 px-1 rounded">VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-chave-aqui</code></li>
                <li>Obtenha sua chave em: <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="underline">Painel de Desenvolvedores</a></li>
                <li>Reinicie o servidor de desenvolvimento</li>
              </ol>
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-full border border-[#E8DCC4] text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  // Detectar ambiente da chave pública
  const isPublicKeyProduction = publicKey.startsWith('APP_USR-');
  const isPublicKeyTest = publicKey.startsWith('TEST-');
  
  // Log do ambiente detectado
  useEffect(() => {
    console.log('🔑 Ambiente da chave pública detectado:', {
      environment: isPublicKeyProduction ? 'PRODUÇÃO' : isPublicKeyTest ? 'TESTE' : 'DESCONHECIDO',
      key_preview: publicKey.substring(0, 15) + '...',
    });
    
    if (isPublicKeyProduction) {
      console.log('⚠️ ATENÇÃO: Frontend usando chave pública de PRODUÇÃO');
      console.log('   Certifique-se de que o backend também está usando access token de PRODUÇÃO');
    } else if (isPublicKeyTest) {
      console.log('ℹ️ Frontend usando chave pública de TESTE');
      console.log('   Certifique-se de que o backend também está usando access token de TESTE');
    }
  }, [publicKey, isPublicKeyProduction, isPublicKeyTest]);

  const handleCardPaymentSubmit = useCallback(async (formData: any) => {
    // Prevenir múltiplas submissões usando ref (não causa re-render)
    if (isSubmittingRef.current) {
      console.log('⏳ Já processando pagamento, ignorando nova submissão');
      return;
    }

    console.log('📝 Dados do formulário recebidos:', formData);
    isSubmittingRef.current = true;

    try {
      // O CardPayment Brick já retorna o token do cartão
      const { token, installments, payment_method_id, payer, issuerId } = formData;

      if (!token) {
        throw new Error('Token do cartão não foi gerado');
      }

      console.log('🔐 Token recebido:', token);
      console.log('💳 Método de pagamento:', payment_method_id);
      console.log('📊 Parcelas:', installments);
      console.log('🏦 Issuer ID:', issuerId);
      console.log('👤 Payer:', payer);

      // Criar pagamento no backend
      const paymentData = {
        registration_id: registrationId,
        transaction_amount: amount,
        description: `Pagamento com cartão de crédito`,
        payment_method_id: payment_method_id,
        payer: {
          email: payer?.email || payerEmail || 'test@test.com',
          identification: {
            type: payer?.identification?.type || 'CPF',
            number: payer?.identification?.number || payerCpf?.replace(/\D/g, '') || '',
          },
        },
        token: token,
        installments: installments || 1,
        issuer_id: issuerId,
      };

      console.log('💳 Criando pagamento com dados:', paymentData);
      const payment = await api.createPayment(paymentData);

      console.log('✅ Pagamento criado:', payment);

      // Verificar status do pagamento
      if (payment.status === 'approved') {
        // Chamar callback apenas uma vez para pagamentos aprovados
        if (!paymentSuccessTriggeredRef.current) {
          paymentSuccessTriggeredRef.current = true;
          onPaymentSuccess();
        }
        // Não resetar estados para approved - componente será desmontado
        return;
      } else if (payment.status === 'pending') {
        toast.warning('⏳ Pagamento está sendo processado. Aguarde a confirmação.');
        // Não resetar estados para pending - aguardar confirmação
        return;
      } else if (payment.status === 'rejected') {
        const errorMsg = REJECTION_REASONS[payment.status_detail] || payment.status_detail || 'Motivo desconhecido';
        toast.error(`❌ Pagamento rejeitado: ${errorMsg}`);

        console.error('💳 Detalhes da rejeição:', {
          status: payment.status,
          status_detail: payment.status_detail,
          payment_id: payment.id || payment.payment_id,
        });

        // Resetar estados imediatamente após rejeição para permitir nova tentativa
        resetPaymentState();
        return; // Sair da função para não executar o finally
      } else {
        toast.info(`ℹ️ Status do pagamento: ${payment.status}`);
        // Resetar estados para outros status desconhecidos
        resetPaymentState();
        return;
      }
    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento:', error);

      let errorMessage = 'Erro ao processar pagamento. Tente novamente.';
      let errorDetails = '';

      // Tratamento específico para erro de token não encontrado
      if (error.response?.data?.code === 2006 || 
          error.response?.data?.error === 'Token do cartão não encontrado' ||
          error.message?.includes('Token not found')) {
        errorMessage = '❌ Erro: Token do cartão não encontrado';
        errorDetails = error.response?.data?.details || 
          'O token do cartão não foi encontrado. Isso geralmente acontece quando há incompatibilidade entre credenciais de teste e produção.';
        
        console.error('🔴 ERRO DE TOKEN:', {
          message: error.response?.data?.message,
          details: error.response?.data?.details,
          solution: error.response?.data?.solution,
        });

        // Mostrar mensagem detalhada
        toast.error(
          <div>
            <div className="font-semibold">{errorMessage}</div>
            {errorDetails && <div className="text-sm mt-1">{errorDetails}</div>}
            {error.response?.data?.solution && (
              <div className="text-xs mt-2 text-yellow-200">
                💡 {error.response.data.solution}
              </div>
            )}
          </div>,
          { autoClose: 10000 }
        );
      } else {
        // Tratamento genérico para outros erros
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        if (error.response?.data?.details) {
          errorDetails = error.response.data.details;
        }

        if (errorDetails) {
          toast.error(
            <div>
              <div className="font-semibold">{errorMessage}</div>
              <div className="text-sm mt-1">{errorDetails}</div>
            </div>,
            { autoClose: 8000 }
          );
        } else {
          toast.error(errorMessage);
        }
      }
      
      // Resetar estados imediatamente após erro para permitir nova tentativa
      resetPaymentState();
      return; // Sair da função para não executar o finally
    } finally {
      // Só executar finally se não retornou antes (caso raro)
      isSubmittingRef.current = false;
    }
  }, [registrationId, amount, payerEmail, payerCpf, onPaymentSuccess, resetPaymentState]);

  const handleCardPaymentError = useCallback((error: any) => {
    console.error('❌ Erro no CardPayment Brick:', error);

    // Não mostrar toast para erros de validação (o Brick já mostra)
    if (error?.type !== 'validation') {
      toast.error('Erro ao processar cartão. Verifique os dados e tente novamente.');
    }
  }, []);

  const handleCardPaymentReady = useCallback(() => {
    console.log('✅ CardPayment Brick pronto para uso');
  }, []);

  const initialization = useMemo(() => ({
    amount: amount,
    payer: {
      email: payerEmail || '',
      identification: {
        type: 'CPF',
        number: payerCpf || '',
      },
    },
  }), [amount, payerEmail, payerCpf]);

  const customization = useMemo(() => ({
    visual: {
      style: {
        theme: 'default',
      } as const, // Forçar tipo para evitar erro de TS
    },
    paymentMethods: {
      maxInstallments: 12,
    },
  }), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-xl p-6 text-white text-center">
        <CreditCard className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-2xl font-semibold mb-2">Pagamento com Cartão</h3>
        <p className="text-3xl font-bold">{formatPrice(amount)}</p>
      </div>

      {/* Aviso de Teste */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-900 font-semibold mb-1">
              🧪 Modo de Teste
            </p>
            <p className="text-yellow-700 text-sm">
              Use os dados de teste abaixo. Em produção, o cartão real será cobrado.
            </p>
          </div>
        </div>
      </div>

      {/* CardPayment Brick do Mercado Pago */}
      {/* Usar componente memoizado para evitar recarregamento quando estados mudam */}
      {/* A chave muda quando há rejeição para forçar reset do componente */}
      <div className="bg-white rounded-xl p-6 border border-[#E8DCC4]">
        <CardPaymentWrapper
          key={cardPaymentKey}
          initialization={initialization}
          onSubmit={handleCardPaymentSubmit}
          onReady={handleCardPaymentReady}
          onError={handleCardPaymentError}
          customization={customization}
        />
      </div>

      {/* Botão Voltar */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full border border-[#E8DCC4] text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
      </div>

      {/* Dados de Teste */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          📋 Dados de Teste do Mercado Pago
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-700 font-medium mb-1">✅ Cartão Aprovado:</p>
            <p className="text-gray-600 font-mono">5031 4332 1540 6351</p>
            <p className="text-gray-600">Nome: APRO</p>
            <p className="text-gray-600">CVV: 123 | Validade: 11/30</p>
            <p className="text-gray-600">CPF: 12345678909</p>
          </div>
          <div>
            <p className="text-gray-700 font-medium mb-1">❌ Cartão Recusado:</p>
            <p className="text-gray-600 font-mono">5031 4332 1540 6351</p>
            <p className="text-gray-600">Nome: OTHE</p>
          </div>
          <div>
            <p className="text-gray-700 font-medium mb-1">⏳ Pagamento Pendente:</p>
            <p className="text-gray-600 font-mono">5031 4332 1540 6351</p>
            <p className="text-gray-600">Nome: PEND</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardPayment;
