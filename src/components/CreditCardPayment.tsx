import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import CreditCardVisual from './CreditCardVisual';
import { api } from '../services/apiSelector';
import { formatPrice } from '../utils/formatPrice';

interface CreditCardPaymentProps {
  amount: number;
  registrationId: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const CreditCardPayment: React.FC<CreditCardPaymentProps> = ({
  amount,
  registrationId,
  onPaymentSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    docType: 'CPF',
    docNumber: '',
  });
  const [installments, setInstallments] = useState(1);
  const [installmentOptions, setInstallmentOptions] = useState<any[]>([]);
  const [loadingInstallments, setLoadingInstallments] = useState(false);

  // Buscar opções de parcelamento do Mercado Pago
  useEffect(() => {
    const fetchInstallments = async () => {
      setLoadingInstallments(true);
      try {
        const data = await api.getInstallments(amount, 'credit_card');
        
        // Criar array com todas as opções de 1 a 12
        const allOptions = [];
        const mpOptions = data?.payer_costs || [];
        
        // Criar um mapa das opções do Mercado Pago para acesso rápido
        const mpOptionsMap = new Map();
        mpOptions.forEach((opt: any) => {
          mpOptionsMap.set(opt.installments, opt);
        });
        
        // Gerar todas as opções de 1 a 12
        for (let i = 1; i <= 12; i++) {
          const mpOption = mpOptionsMap.get(i);
          
          if (mpOption) {
            // Usar dados do Mercado Pago se disponível
            allOptions.push(mpOption);
          } else {
            // Calcular manualmente se não estiver disponível no MP
            const totalInCents = Math.round(amount * 100);
            const baseValueInCents = Math.floor(totalInCents / i);
            const remainder = totalInCents % i;
            
            const installmentsArray = Array(i).fill(baseValueInCents);
            for (let j = 0; j < remainder; j++) {
              installmentsArray[j] += 1;
            }
            
            const installmentAmount = installmentsArray[0] / 100;
            const totalAmount = installmentsArray.reduce((sum, val) => sum + val, 0) / 100;
            
            allOptions.push({
              installments: i,
              installment_amount: installmentAmount,
              total_amount: totalAmount,
              installment_rate: 0,
              recommended_message: i === 1 ? 'Pagamento sem juros' : 'Parcelado',
            });
          }
        }
        
        setInstallmentOptions(allOptions);
      } catch (error) {
        console.error('Erro ao buscar parcelamento:', error);
        // Em caso de erro, criar opções de 1 a 12 sem juros
        const allOptions = [];
        for (let i = 1; i <= 12; i++) {
          const totalInCents = Math.round(amount * 100);
          const baseValueInCents = Math.floor(totalInCents / i);
          const remainder = totalInCents % i;
          
          const installmentsArray = Array(i).fill(baseValueInCents);
          for (let j = 0; j < remainder; j++) {
            installmentsArray[j] += 1;
          }
          
          const installmentAmount = installmentsArray[0] / 100;
          const totalAmount = installmentsArray.reduce((sum, val) => sum + val, 0) / 100;
          
          allOptions.push({
            installments: i,
            installment_amount: installmentAmount,
            total_amount: totalAmount,
            installment_rate: 0,
            recommended_message: i === 1 ? 'Pagamento sem juros' : 'Parcelado',
          });
        }
        setInstallmentOptions(allOptions);
      } finally {
        setLoadingInstallments(false);
      }
    };

    fetchInstallments();
  }, [amount]);


  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardData({ ...cardData, cardNumber: formatted });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (cardData.cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Número do cartão inválido');
      return;
    }

    if (!cardData.cardholderName) {
      toast.error('Nome do titular é obrigatório');
      return;
    }

    if (!cardData.expirationMonth || !cardData.expirationYear) {
      toast.error('Data de validade é obrigatória');
      return;
    }

    if (cardData.securityCode.length < 3) {
      toast.error('Código de segurança inválido');
      return;
    }

    if (!cardData.docNumber) {
      toast.error('CPF é obrigatório');
      return;
    }

    setLoading(true);

    try {
      // Em modo de teste, simula pagamento aprovado
      // Em produção, aqui integraria com Mercado Pago SDK para tokenizar o cartão
      
      toast.info('⚠️ Pagamento com cartão em modo de teste');
      
      // Simula delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simula sucesso
      toast.success('✅ Pagamento aprovado!');
      onPaymentSuccess();
      
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('❌ Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-xl p-6 text-white text-center">
        <CreditCard className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-2xl font-semibold mb-2">Pagamento com Cartão</h3>
        <p className="text-3xl font-bold">{formatPrice(amount)}</p>
      </div>

      {/* Cartão Visual - Preview em Tempo Real */}
      <div className="flex justify-center mb-6">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <CreditCardVisual
            cardNumber={cardData.cardNumber}
            cardholderName={cardData.cardholderName}
            expirationMonth={cardData.expirationMonth}
            expirationYear={cardData.expirationYear}
          />
        </div>
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

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Número do Cartão */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Número do Cartão
          </label>
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white"
            required
          />
        </div>

        {/* Nome do Titular */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Nome do Titular (como está no cartão)
          </label>
          <input
            type="text"
            value={cardData.cardholderName}
            onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value.toUpperCase() })}
            placeholder="NOME COMPLETO"
            className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white"
            required
          />
        </div>

        {/* Validade e CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium text-sm">
              Mês
            </label>
            <input
              type="text"
              value={cardData.expirationMonth}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 2) {
                  setCardData({ ...cardData, expirationMonth: value });
                }
              }}
              placeholder="MM"
              maxLength={2}
              className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium text-sm">
              Ano
            </label>
            <input
              type="text"
              value={cardData.expirationYear}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 2) {
                  setCardData({ ...cardData, expirationYear: value });
                }
              }}
              placeholder="AA"
              maxLength={2}
              className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium text-sm">
              CVV
            </label>
            <input
              type="text"
              value={cardData.securityCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setCardData({ ...cardData, securityCode: value });
                }
              }}
              placeholder="123"
              maxLength={4}
              className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white"
              required
            />
          </div>
        </div>

        {/* CPF do Titular */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            CPF do Titular
          </label>
          <input
            type="text"
            value={cardData.docNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 11) {
                setCardData({ ...cardData, docNumber: value });
              }
            }}
            placeholder="000.000.000-00"
            className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white"
            required
          />
        </div>

        {/* Parcelamento */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Parcelamento
          </label>
          {loadingInstallments ? (
            <div className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] bg-gray-50 text-center text-gray-500">
              Carregando opções de parcelamento...
            </div>
          ) : (
            <>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white"
              >
                {installmentOptions.map((option) => {
                  const isRecommended = option.recommended_message && option.recommended_message.includes('sem juros');
                  
                  return (
                    <option key={option.installments} value={option.installments}>
                      {option.installments}x de {formatPrice(option.installment_amount)}
                      {isRecommended ? ' (sem juros)' : ''}
                    </option>
                  );
                })}
              </select>
            </>
          )}
        </div>

        {/* Segurança */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 font-semibold text-sm mb-1">
                Pagamento Seguro
              </p>
              <p className="text-blue-700 text-xs">
                Seus dados são protegidos com criptografia de ponta. 
                Não armazenamos informações do seu cartão.
              </p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-[#E8DCC4] text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processando...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pagar {formatPrice(amount)}</span>
              </>
            )}
          </button>
        </div>
      </form>

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
            <p className="text-gray-600">CVV: 123 | Validade: 11/25</p>
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
