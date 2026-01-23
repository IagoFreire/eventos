import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Clock, QrCode as QrCodeIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/formatPrice';

interface PixPaymentProps {
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  amount: number;
  onPaymentConfirmed?: () => void;
  isTestMode?: boolean;
  registrationId?: string;
  paymentId?: string;
  checkPaymentStatus?: (paymentId: string) => Promise<any>;
  checkRegistrationStatus?: (registrationId: string) => Promise<any>;
}

const PixPayment: React.FC<PixPaymentProps> = ({
  qrCode,
  qrCodeBase64,
  ticketUrl: _ticketUrl,
  amount,
  onPaymentConfirmed,
  isTestMode = false,
  registrationId,
  paymentId,
  checkPaymentStatus,
  checkRegistrationStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos
  const [isChecking, setIsChecking] = useState(false);

  // Timer de contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Polling para verificar status do pagamento automaticamente
  useEffect(() => {
    // Não fazer polling em modo de teste (usa botão manual)
    if (isTestMode || !onPaymentConfirmed) {
      return;
    }

    // Priorizar verificação da inscrição no banco (atualizada pelo webhook)
    // Se não tiver função de verificar inscrição, usar verificação do pagamento
    const shouldCheckRegistration = registrationId && checkRegistrationStatus;
    const shouldCheckPayment = paymentId && checkPaymentStatus;

    if (!shouldCheckRegistration && !shouldCheckPayment) {
      return;
    }

    console.log('🔄 Iniciando verificação automática do status do pagamento...');

    // Verificar a cada 5 segundos
    const checkInterval = setInterval(async () => {
      if (isChecking) return; // Evitar múltiplas verificações simultâneas
      
      setIsChecking(true);
      try {
        let isApproved = false;

        // Primeiro, verificar status da inscrição no banco (mais confiável - atualizado pelo webhook)
        if (shouldCheckRegistration) {
          console.log(`🔍 Verificando status da inscrição ${registrationId} no banco...`);
          const registration = await checkRegistrationStatus(registrationId);
          
          if (registration?.payment_status === 'approved') {
            console.log('✅ Pagamento aprovado detectado no banco de dados!');
            isApproved = true;
          } else {
            console.log(`📊 Status da inscrição: ${registration?.payment_status || 'desconhecido'}`);
          }
        }

        // Se não estiver aprovado no banco, verificar status no Mercado Pago
        if (!isApproved && shouldCheckPayment) {
          console.log(`🔍 Verificando status do pagamento ${paymentId} no Mercado Pago...`);
          const paymentStatus = await checkPaymentStatus(paymentId);
          
          console.log('📊 Status do pagamento:', paymentStatus);
          
          if (paymentStatus?.status === 'approved') {
            console.log('✅ Pagamento aprovado detectado no Mercado Pago!');
            isApproved = true;
          } else if (paymentStatus?.status === 'rejected') {
            console.log('❌ Pagamento rejeitado');
            clearInterval(checkInterval);
            toast.error('❌ Pagamento foi rejeitado. Por favor, tente novamente.');
            setIsChecking(false);
            return;
          }
        }

        // Se aprovado, confirmar e parar polling
        if (isApproved) {
          console.log('✅ Confirmando pagamento automaticamente...');
          clearInterval(checkInterval);
          onPaymentConfirmed();
        }
        // Se estiver pending ou outro status, continua verificando
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
        // Não limpar o intervalo em caso de erro, continua tentando
      } finally {
        setIsChecking(false);
      }
    }, 5000); // Verificar a cada 5 segundos

    // Limpar intervalo quando componente desmontar
    return () => {
      console.log('🛑 Parando verificação automática do pagamento');
      clearInterval(checkInterval);
    };
  }, [registrationId, paymentId, checkRegistrationStatus, checkPaymentStatus, onPaymentConfirmed, isTestMode, isChecking]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const handleCopyQrCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-xl p-6 text-white text-center">
        <QrCodeIcon className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-2xl font-semibold mb-2">Pagamento via PIX</h3>
        <p className="text-3xl font-bold">{formatPrice(amount)}</p>
      </div>

      {/* Timer */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-orange-600" />
          <div>
            <p className="text-sm text-gray-600">Tempo restante para pagamento</p>
            <p className="text-2xl font-mono font-bold text-orange-600">
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {qrCodeBase64 && (
        <div className="bg-white rounded-xl p-6 border-2 border-[#E8DCC4] shadow-lg">
          <div className="flex flex-col items-center">
            <p className="text-gray-700 mb-4 text-center font-medium">
              Escaneie o QR Code com o app do seu banco
            </p>
            <div className="bg-white p-4 rounded-lg border-4 border-[#D4AF37] shadow-md">
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-64 h-64"
              />
            </div>
          </div>
        </div>
      )}

      {/* Copiar Código */}
      {qrCode && (
        <div className="bg-[#F5F5DC] rounded-xl p-6 border border-[#E8DCC4]">
          <p className="text-gray-700 mb-3 font-medium text-center">
            Ou copie o código PIX:
          </p>
          <div className="bg-white rounded-lg p-3 mb-3 border border-gray-300">
            <p className="text-xs font-mono break-all text-gray-600">
              {qrCode}
            </p>
          </div>
          <button
            onClick={handleCopyQrCode}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white hover:shadow-lg'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Código Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copiar Código PIX</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">
          Como pagar com PIX:
        </h4>
        <ol className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
              1
            </span>
            <span>Abra o app do seu banco e escolha pagar com PIX</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
              2
            </span>
            <span>Escaneie o QR Code ou copie e cole o código</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
              3
            </span>
            <span>Confirme o pagamento no app do seu banco</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
              4
            </span>
            <span>Aguarde a confirmação (geralmente é instantâneo)</span>
          </li>
        </ol>
      </div>

      {/* Botão para Simular Pagamento (sempre visível para testes) */}
      {onPaymentConfirmed && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
          <div className="text-center mb-4">
            <p className="text-yellow-900 font-semibold mb-2">
              {isTestMode ? '🧪 Modo de Teste Ativo' : '🧪 Teste Manual'}
            </p>
            <p className="text-yellow-700 text-sm">
              {isTestMode 
                ? 'Este QR Code é simulado. Para testar, clique no botão abaixo:'
                : 'Para testar manualmente ou se o pagamento já foi aprovado, clique abaixo:'}
            </p>
          </div>
          <button
            onClick={onPaymentConfirmed}
            className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">✅ Simular/Confirmar Pagamento</span>
          </button>
          <p className="text-yellow-600 text-xs text-center mt-3">
            {isTestMode 
              ? 'Clique para simular que o pagamento foi aprovado pelo banco'
              : 'O sistema também verifica automaticamente a cada 5 segundos'}
          </p>
        </div>
      )}

      {/* Informação Adicional */}
      <div className="text-center text-sm text-gray-500">
        <p>O pagamento será confirmado automaticamente após a aprovação.</p>
      </div>
    </div>
  );
};

export default PixPayment;
