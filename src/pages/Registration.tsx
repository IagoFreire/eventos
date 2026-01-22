import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../contexts/RegistrationContext';
import { useEvent } from '../contexts/EventContext';
import { api } from '../services/apiSelector';
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, CreditCard, Calendar } from 'lucide-react';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { formData, setFormData, currentStep, setCurrentStep, registrationId, setRegistrationId } = useRegistration();
  const { currentEvent } = useEvent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const event = currentEvent || {
    id: '1',
    title: 'Retiro Espiritual 2026',
    price: 350.00,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }

    setError('');
    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setLoading(true);
        try {
          const registration = await api.createRegistration({
            ...formData,
            event_id: event.id,
          });
          setRegistrationId(registration.id);
          setCurrentStep(2);
        } catch (err) {
          setError('Erro ao criar inscrição. Tente novamente.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handlePayment = async () => {
    if (!registrationId) {
      setError('Erro: ID de inscrição não encontrado. Por favor, reinicie o processo.');
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        transaction_amount: event.price,
        description: `Inscrição - ${event.title}`,
        payment_method_id: 'pix',
        payer: {
          email: formData.email,
          identification: {
            type: 'CPF',
            number: formData.cpf.replace(/\D/g, ''),
          },
        },
      };

      const payment = await api.createPayment(paymentData);
      console.log('Pagamento criado:', payment);
      
      // Redireciona para a página de confirmação com o ingresso
      navigate(`/confirmacao?id=${registrationId}`);
    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => currentStep === 1 ? navigate('/') : setCurrentStep(1)}
            className="flex items-center gap-2 text-[#B8860B] hover:text-[#D4AF37] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <h1 className="text-4xl mb-4 text-gray-800">Inscrição para o Evento</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className={currentStep >= 1 ? 'text-gray-800' : 'text-gray-500'}>Dados Pessoais</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 rounded">
              <div 
                className={`h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded transition-all ${
                  currentStep >= 2 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className={currentStep >= 2 ? 'text-gray-800' : 'text-gray-500'}>Pagamento</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl mb-6 text-gray-800">Informações Pessoais</h2>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">CPF *</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Endereço Completo</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                  placeholder="Rua, número, bairro, cidade, estado (opcional)"
                  rows={3}
                />
              </div>

              <button
                onClick={handleNextStep}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Processando...' : 'Próxima Etapa'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-[#F5F5DC] rounded-xl p-6 mb-6">
                <h3 className="text-xl mb-4 text-gray-800">Resumo da Inscrição</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Participante:</span>
                    <span>{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>E-mail:</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E8DCC4] pt-2 mt-2">
                    <span>Valor Total:</span>
                    <span className="text-[#B8860B] text-xl">{formatPrice(event.price)}</span>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl mb-6 text-gray-800">Escolha a forma de pagamento</h2>

              <div className="space-y-4">
                <div className="border border-[#E8DCC4] rounded-lg p-4 hover:border-[#D4AF37] cursor-pointer transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                    <span className="text-2xl">📱</span>
                    <span className="text-gray-800">PIX</span>
                  </label>
                </div>
                <div className="border border-[#E8DCC4] rounded-lg p-4 hover:border-[#D4AF37] cursor-pointer transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" className="w-4 h-4" />
                    <span className="text-2xl">💳</span>
                    <span className="text-gray-800">Cartão de Crédito</span>
                  </label>
                </div>
                <div className="border border-[#E8DCC4] rounded-lg p-4 hover:border-[#D4AF37] cursor-pointer transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" className="w-4 h-4" />
                    <span className="text-2xl">📄</span>
                    <span className="text-gray-800">Boleto</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePreviousStep}
                  disabled={loading}
                  className="flex-1 border border-[#E8DCC4] text-gray-700 py-3 rounded-full hover:bg-white/50 transition-all disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  <span>{loading ? 'Processando...' : 'Confirmar Pagamento'}</span>
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Ao confirmar, você concorda com nossos termos de serviço
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;
