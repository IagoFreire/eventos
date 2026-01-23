import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRegistration } from '../contexts/RegistrationContext';
import { useEvent } from '../contexts/EventContext';
import { api } from '../services/apiSelector';
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, Calendar, CheckCircle, Download, Printer, MapPin, Clock, QrCode, Home } from 'lucide-react';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { formData, setFormData, currentStep, setCurrentStep, registrationId, setRegistrationId } = useRegistration();
  const { currentEvent } = useEvent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ticketRef = useRef<HTMLDivElement>(null);

  const event = currentEvent || {
    id: '1',
    title: 'Retiro Espiritual 2026',
    price: 350.00,
    date: '2026-03-15T09:00:00',
    location: 'Centro de Retiros Nova Vida',
    description: '',
    image_url: '',
    max_participants: 100,
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
      
      // Avança para a etapa de confirmação
      setCurrentStep(3);
      toast.success('Pagamento processado com sucesso!');
    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.');
      toast.error('Erro ao processar pagamento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info('Funcionalidade de download do ingresso em desenvolvimento!');
  };

  const handleFinish = () => {
    // Reseta o formulário e volta para home
    setCurrentStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      address: '',
      event_id: '',
    });
    setRegistrationId(null);
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          {currentStep < 3 && (
            <button
              onClick={() => currentStep === 1 ? navigate('/') : setCurrentStep(currentStep - 1)}
              className="flex items-center gap-2 text-[#B8860B] hover:text-[#D4AF37] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          )}

          <h1 className="text-4xl mb-4 text-gray-800">
            {currentStep === 3 ? 'Confirmação de Inscrição' : 'Inscrição para o Evento'}
          </h1>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className={`hidden sm:inline ${currentStep >= 1 ? 'text-gray-800' : 'text-gray-500'}`}>Dados</span>
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
                {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className={`hidden sm:inline ${currentStep >= 2 ? 'text-gray-800' : 'text-gray-500'}`}>Pagamento</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 rounded">
              <div 
                className={`h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded transition-all ${
                  currentStep >= 3 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > 3 ? <Check className="w-5 h-5" /> : '3'}
              </div>
              <span className={`hidden sm:inline ${currentStep >= 3 ? 'text-gray-800' : 'text-gray-500'}`}>Confirmação</span>
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

          {currentStep === 3 && (
            <div>
              {/* Success Message */}
              <div className="text-center mb-8 print:hidden">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl mb-4 text-gray-800">Inscrição Confirmada!</h2>
                <p className="text-lg text-gray-600 mb-2">
                  Obrigado por se inscrever, <strong>{formData.name}</strong>!
                </p>
                <p className="text-gray-600">
                  Seu ingresso foi gerado e enviado para <strong>{formData.email}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center mb-8 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-3 bg-white/80 border border-[#E8DCC4] rounded-full hover:bg-white hover:border-[#D4AF37] transition-colors shadow-md"
                >
                  <Printer className="w-5 h-5 text-[#B8860B]" />
                  <span className="text-gray-700">Imprimir Ingresso</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-full hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>Baixar Ingresso (PDF)</span>
                </button>
              </div>

              {/* Ticket */}
              <div ref={ticketRef} className="bg-white rounded-2xl border-4 border-[#D4AF37] overflow-hidden shadow-2xl mb-8">
                {/* Header do Ingresso */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                  <p className="text-sm opacity-90">Ingresso Digital</p>
                </div>

                {/* Corpo do Ingresso */}
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Informações do Participante */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#B8860B]" />
                        Participante
                      </h4>
                      <div className="space-y-3 text-gray-700">
                        <div>
                          <p className="text-sm text-gray-500">Nome:</p>
                          <p className="font-medium">{formData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">E-mail:</p>
                          <p className="font-medium">{formData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Telefone:</p>
                          <p className="font-medium">{formData.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">CPF:</p>
                          <p className="font-medium">{formData.cpf}</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações do Evento */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#B8860B]" />
                        Detalhes do Evento
                      </h4>
                      <div className="space-y-3 text-gray-700">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-5 h-5 text-[#B8860B] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Data:</p>
                            <p className="font-medium">{formatDate(event.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-[#B8860B] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Horário:</p>
                            <p className="font-medium">09h00</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-[#B8860B] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Local:</p>
                            <p className="font-medium">{event.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code e ID */}
                  <div className="border-t-2 border-dashed border-[#E8DCC4] pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      {/* QR Code Placeholder */}
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-[#F5F5DC] rounded-lg flex items-center justify-center mb-2 border-2 border-[#E8DCC4]">
                          <QrCode className="w-16 h-16 text-[#B8860B]" />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Apresente este QR Code<br />na entrada do evento
                        </p>
                      </div>

                      {/* ID do Ingresso */}
                      <div className="flex-1 text-center md:text-right">
                        <p className="text-sm text-gray-500 mb-1">ID do Ingresso:</p>
                        <p className="font-mono text-lg text-[#B8860B] font-bold">
                          {registrationId?.toUpperCase().slice(0, 12)}
                        </p>
                        <p className="text-xs text-gray-500 mt-4">
                          Emitido em: {formatDateTime(new Date().toISOString())}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer do Ingresso */}
                <div className="bg-[#F5F5DC] px-8 py-4 border-t border-[#E8DCC4]">
                  <p className="text-xs text-gray-600 text-center">
                    ⚠️ Este ingresso é pessoal e intransferível. Apresente um documento de identidade na entrada.
                  </p>
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-4 rounded-full hover:shadow-lg transition-all print:hidden"
              >
                <Home className="w-5 h-5" />
                <span>Voltar para o Início</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;
