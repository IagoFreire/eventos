import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import { useRegistration } from '../contexts/RegistrationContext';
import { useEvent } from '../contexts/EventContext';
import { api } from '../services/apiSelector';
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, Calendar, CheckCircle, Download, Printer, MapPin, Clock, QrCode, Home, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PixPayment from '../components/PixPayment';
import CreditCardPayment from '../components/CreditCardPayment';
import { generateTestData } from '../utils/generateTestData';
import { formatPrice } from '../utils/formatPrice';
import { searchCep, formatCep } from '../services/cep';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { formData, setFormData, currentStep, setCurrentStep, registrationId, setRegistrationId } = useRegistration();
  const { currentEvent } = useEvent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pixData, setPixData] = useState<any>(null);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [showCreditCardPayment, setShowCreditCardPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [loadingCep, setLoadingCep] = useState(false);
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
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    // Atualiza o endereço completo automaticamente quando campos de endereço mudam
    if (['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'cep'].includes(e.target.name)) {
      const parts: string[] = [];
      if (newFormData.street) parts.push(newFormData.street);
      if (newFormData.number) parts.push(`nº ${newFormData.number}`);
      if (newFormData.complement) parts.push(newFormData.complement);
      if (newFormData.neighborhood) parts.push(newFormData.neighborhood);
      if (newFormData.city) parts.push(newFormData.city);
      if (newFormData.state) parts.push(newFormData.state);
      if (newFormData.cep) parts.push(`CEP: ${newFormData.cep}`);
      newFormData.address = parts.length > 0 ? parts.join(', ') : '';
    }
    
    setFormData(newFormData);
  };

  // Função para buscar inscrição pendente quando o email for digitado
  const handleEmailBlur = async () => {
    const email = formData.email.trim();
    
    // Valida formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return;
    }

    // Só busca se não tiver nome preenchido (indicando que é uma nova inscrição)
    if (formData.name) {
      return;
    }

    setLoadingCep(true);
    try {
      const pendingRegistration = await api.getPendingRegistrationByEmail(email, event.id);
      
      if (pendingRegistration) {
        // Preenche os dados da inscrição pendente
        setFormData({
          ...formData,
          name: pendingRegistration.name,
          email: pendingRegistration.email,
          phone: pendingRegistration.phone,
          cpf: pendingRegistration.cpf,
          address: pendingRegistration.address || '',
        });
        
        // Se tiver registration ID, atualiza
        if (pendingRegistration.id) {
          setRegistrationId(pendingRegistration.id);
        }
        
        toast.info('Inscrição pendente encontrada! Dados preenchidos automaticamente.');
      }
    } catch (error: any) {
      // Ignora erros silenciosamente - não é um problema se não encontrar
      console.log('Nenhuma inscrição pendente encontrada para este email');
    } finally {
      setLoadingCep(false);
    }
  };

  // Função para buscar CEP
  const handleCepSearch = async (cep: string, preserveData?: Partial<typeof formData>) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    // Só busca se tiver 8 dígitos
    if (cleanCep.length !== 8) {
      return;
    }

    setLoadingCep(true);
    try {
      const cepData = await searchCep(cleanCep);
      
      if (cepData) {
        setFormData((prev) => {
          const updatedData = {
            ...prev,
            ...preserveData, // Preserva dados passados (como nome, email, etc)
            cep: formatCep(cleanCep),
            street: cepData.logradouro || '',
            neighborhood: cepData.bairro || '',
            city: cepData.localidade || '',
            state: cepData.uf || '',
            complement: cepData.complemento || '',
          };
          
          // Atualiza o endereço completo
          const parts: string[] = [];
          if (updatedData.street) parts.push(updatedData.street);
          if (updatedData.number) parts.push(`nº ${updatedData.number}`);
          if (updatedData.complement) parts.push(updatedData.complement);
          if (updatedData.neighborhood) parts.push(updatedData.neighborhood);
          if (updatedData.city) parts.push(updatedData.city);
          if (updatedData.state) parts.push(updatedData.state);
          if (updatedData.cep) parts.push(`CEP: ${updatedData.cep}`);
          updatedData.address = parts.length > 0 ? parts.join(', ') : '';
          
          return updatedData;
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao buscar CEP', { autoClose: 3000 });
    } finally {
      setLoadingCep(false);
    }
  };

  // Função para formatar CEP enquanto digita
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setFormData({
      ...formData,
      cep: formatted,
    });

    // Busca automaticamente quando tiver 8 dígitos
    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      handleCepSearch(cleanCep);
    }
  };

  // Função para combinar campos de endereço em um endereço completo
  const buildFullAddress = (): string => {
    const parts: string[] = [];
    
    if (formData.street) parts.push(formData.street);
    if (formData.number) parts.push(`nº ${formData.number}`);
    if (formData.complement) parts.push(formData.complement);
    if (formData.neighborhood) parts.push(formData.neighborhood);
    if (formData.city) parts.push(formData.city);
    if (formData.state) parts.push(formData.state);
    if (formData.cep) parts.push(`CEP: ${formData.cep}`);
    
    return parts.length > 0 ? parts.join(', ') : formData.address || '';
  };

  // Função para preencher dados de teste
  const handleFillTestData = async () => {
    const testData = generateTestData();
    const randomNumber = Math.floor(1 + Math.random() * 9999);
    
    // Preenche os dados básicos primeiro
    const basicData = {
      name: testData.name,
      email: testData.email,
      phone: testData.phone,
      cpf: testData.cpf,
      cep: testData.cep,
      number: randomNumber.toString(),
    };
    
    setFormData({
      ...formData,
      ...basicData,
    });
    
    // Busca o CEP automaticamente para preencher os campos de endereço
    // Passa os dados básicos para preservá-los durante a busca
    if (testData.cep) {
      try {
        await handleCepSearch(testData.cep.replace(/\D/g, ''), basicData);
      } catch (err) {
        // Se falhar a busca, apenas mostra o CEP preenchido
        console.warn('Erro ao buscar CEP:', err);
      }
    }
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
        setError(''); // Limpar erro anterior
        
        try {
          // Combina os campos de endereço antes de enviar
          const fullAddress = buildFullAddress();
          
          const registration = await api.createRegistration({
            ...formData,
            address: fullAddress || formData.address,
            event_id: event.id,
          });
          setRegistrationId(registration.id);
          setCurrentStep(2);
        } catch (err: any) {
          console.error('❌ Erro ao criar inscrição:', err);
          
          // Extrair mensagem de erro do backend
          let errorMessage = 'Erro ao criar inscrição. Tente novamente.';
          
          if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          // Traduzir erros comuns
          if (errorMessage.includes('duplicate key') || errorMessage.includes('already exists')) {
            errorMessage = '⚠️ Este CPF ou e-mail já está inscrito neste evento!';
          } else if (errorMessage.includes('event_id')) {
            errorMessage = '🎫 Evento não encontrado. Recarregue a página.';
          } else if (errorMessage.includes('email')) {
            errorMessage = '📧 E-mail inválido. Verifique o formato.';
          } else if (errorMessage.includes('cpf')) {
            errorMessage = '📋 CPF inválido. Use o formato: 123.456.789-09';
          }
          
          setError(errorMessage);
          toast.error(errorMessage, {
            autoClose: 5000,
          });
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
      const errorMsg = 'ID de inscrição não encontrado. Por favor, reinicie o processo.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Se for cartão de crédito, mostrar formulário
    if (paymentMethod === 'credit_card') {
      setShowCreditCardPayment(true);
      return;
    }

    // Se for PIX, processar normalmente
    setLoading(true);
    setError(''); // Limpar erro anterior
    
    try {
      const paymentData = {
        registration_id: registrationId,
        transaction_amount: Number(event.price), // Garantir que seja número
        description: `Inscrição - ${event.title}`,
        payment_method_id: paymentMethod === 'pix' ? 'pix' : 'credit_card',
        payer: {
          email: formData.email,
          identification: {
            type: 'CPF',
            number: formData.cpf.replace(/\D/g, ''),
          },
        },
      };

      const payment = await api.createPayment(paymentData);
      console.log('✅ Pagamento criado:', payment);
      
      // Se tiver dados do PIX (QR Code), mostrar componente de pagamento PIX
      if (payment.pix && payment.pix.qr_code) {
        setPixData(payment.pix);
        setShowPixPayment(true);
        toast.info('📱 Use o QR Code ou copie o código PIX para pagar');
      } else {
        // Se não tiver PIX (modo simulado), avança direto
        setCurrentStep(3);
      }
    } catch (err: any) {
      console.error('❌ Erro ao processar pagamento:', err);
      
      // Extrair mensagem de erro do backend
      let errorMessage = 'Erro ao processar pagamento. Tente novamente.';
      
      if (err.response?.data?.error) {
        // Erro do backend
        errorMessage = err.response.data.error;
      } else if (err.message) {
        // Erro genérico
        errorMessage = err.message;
      }
      
      // Traduzir erros comuns do Mercado Pago
      if (errorMessage.includes('transaction_amount')) {
        errorMessage = '💰 Valor da transação inválido. Verifique o valor do evento.';
      } else if (errorMessage.includes('identification number')) {
        errorMessage = '📋 CPF inválido. Use: 123.456.789-09';
      } else if (errorMessage.includes('invalid_access_token')) {
        errorMessage = '🔑 Token do Mercado Pago inválido. Contate o administrador.';
      } else if (errorMessage.includes('payer.email')) {
        errorMessage = '📧 E-mail inválido. Verifique seu e-mail.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 5000, // 5 segundos para ler a mensagem
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePixPaymentConfirmed = async () => {
    if (!registrationId) {
      toast.error('ID de inscrição não encontrado.');
      return;
    }

    setLoading(true);
    try {
      // Atualizar status para aprovado (simula aprovação do pagamento)
      await api.updateRegistration(registrationId, {
        payment_status: 'approved'
      });
      
      setCurrentStep(3);
    } catch (error: any) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      
      // Se falhar a atualização, permite prosseguir mesmo assim
      setCurrentStep(3);
      toast.warning('Prosseguindo para confirmação...');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReact = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Ingresso - ${event.title} - ${formData.name}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .print-ticket .grid {
          display: grid !important;
        }
        .print-ticket [class*="grid-cols-3"] {
          grid-template-columns: 2fr 1fr !important;
        }
        .print-ticket [class*="col-span-2"] {
          grid-column: span 1 !important;
        }
        .print-ticket .grid-cols-1 {
          grid-template-columns: 2fr 1fr !important;
        }
      }
    `,
  });

  const handlePrint = () => {
    if (!ticketRef.current) {
      toast.error('Ingresso não encontrado. Aguarde o carregamento.');
      return;
    }
    handlePrintReact();
  };

  const handleDownload = async () => {
    if (!ticketRef.current) {
      toast.error('Erro ao gerar PDF. Tente novamente.');
      return;
    }

    if (!registrationId) {
      toast.error('ID de inscrição não encontrado.');
      return;
    }

    try {
      setLoading(true);
      
      // Aguarda um pouco para garantir que o QR Code esteja renderizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Captura o elemento do ingresso como canvas
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
      });

      // Calcula as dimensões do PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Cria o PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Adiciona a primeira página
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adiciona páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Gera o nome do arquivo
      const sanitizedName = formData.name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const sanitizedTitle = event.title.replace(/\s+/g, '-').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const fileName = `ingresso-${sanitizedTitle}-${sanitizedName}.pdf`;
      
      // Faz o download
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
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


  return (
    <div className={`min-h-screen py-12 px-4 ${currentStep === 3 ? 'print-ticket-container' : ''}`}>
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
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl text-gray-800">Informações Pessoais</h2>
                <button
                  type="button"
                  onClick={handleFillTestData}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                  title="Preencher com dados de teste (CPF válido)"
                >
                  <Sparkles className="w-4 h-4" />
                  Preencher Teste
                </button>
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
                  onBlur={handleEmailBlur}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                  placeholder="seu@email.com"
                />
                {loadingCep && (
                  <p className="text-xs text-gray-500 mt-1">Buscando inscrição pendente...</p>
                )}
              </div>

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

              {/* Seção de Endereço */}
              <div className="border-t border-[#E8DCC4] pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#B8860B]" />
                  Endereço
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">CEP</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep || ''}
                        onChange={handleCepChange}
                        className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {loadingCep && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D4AF37]"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Digite o CEP para preencher automaticamente</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Rua/Logradouro</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Número</label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Complemento</label>
                    <input
                      type="text"
                      name="complement"
                      value={formData.complement || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                      placeholder="Apto, bloco, etc. (opcional)"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Bairro</label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                      placeholder="Nome do bairro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Cidade</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                      placeholder="Nome da cidade"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Estado (UF)</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
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

          {currentStep === 2 && !showPixPayment && !showCreditCardPayment && (
            <div className="space-y-6">
              <div className="bg-[#F5F5DC] rounded-xl p-6 mb-6">
                <h3 className="text-xl mb-4 text-gray-800">Resumo da Inscrição</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Participante:</span>
                    <span>{formData.name}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>E-mail:</span>
                    <span className="truncate max-w-[60%] md:max-w-none">{formData.email}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E8DCC4] pt-2 mt-2">
                    <span>Valor Total:</span>
                    <span className="text-[#B8860B] text-xl">{formatPrice(event.price)}</span>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl mb-6 text-gray-800">Escolha a forma de pagamento</h2>

              <div className="space-y-4">
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'pix' 
                      ? 'border-[#D4AF37] bg-[#F5F5DC]' 
                      : 'border-[#E8DCC4] hover:border-[#D4AF37]'
                  }`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                      className="w-4 h-4" 
                    />
                    <span className="text-2xl">📱</span>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">PIX</p>
                      <p className="text-sm text-gray-600">Aprovação instantânea</p>
                    </div>
                  </label>
                </div>
                
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'credit_card' 
                      ? 'border-[#D4AF37] bg-[#F5F5DC]' 
                      : 'border-[#E8DCC4] hover:border-[#D4AF37]'
                  }`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="w-4 h-4" 
                    />
                    <span className="text-2xl">💳</span>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">Cartão de Crédito</p>
                      <p className="text-sm text-gray-600">Parcelamento disponível</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-4">
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

          {currentStep === 2 && showPixPayment && (
            <div className="space-y-6">
              <PixPayment
                qrCode={pixData?.qr_code}
                qrCodeBase64={pixData?.qr_code_base64}
                ticketUrl={pixData?.ticket_url}
                amount={event.price}
                onPaymentConfirmed={handlePixPaymentConfirmed}
                isTestMode={true} // Sempre em modo teste para facilitar
              />
              
              <div className="flex flex-col-reverse md:flex-row gap-4">
                <button
                  onClick={() => setShowPixPayment(false)}
                  className="flex-1 border border-[#E8DCC4] text-gray-700 py-3 rounded-full hover:bg-white/50 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handlePixPaymentConfirmed}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-3 rounded-full hover:shadow-lg transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Já Paguei</span>
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Clique em "Já Paguei" após realizar o pagamento
              </p>
            </div>
          )}

          {currentStep === 2 && showCreditCardPayment && (
            <CreditCardPayment
              amount={event.price}
              registrationId={registrationId || ''}
              onPaymentSuccess={handlePixPaymentConfirmed}
              onCancel={() => setShowCreditCardPayment(false)}
            />
          )}

          {currentStep === 3 && (
            <div className="print-ticket-container">
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
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  <span>{loading ? 'Gerando PDF...' : 'Baixar Ingresso (PDF)'}</span>
                </button>
              </div>

              {/* Ticket */}
              <div ref={ticketRef} className="print-ticket bg-white rounded-xl border-3 border-[#D4AF37] overflow-hidden shadow-xl mb-8 max-w-2xl mx-auto">
                {/* Header do Ingresso */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-3 text-center">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p className="text-sm opacity-90">Ingresso Digital</p>
                </div>

                {/* Corpo do Ingresso */}
                <div className="p-4">
                  {/* Layout compacto: Informações lado a lado */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Coluna 1: Dados do Participante */}
                    <div className="md:col-span-2 order-2 md:order-1">
                      <div className="space-y-2 text-gray-700">
                        <div>
                          <p className="text-sm text-gray-500">Nome:</p>
                          <p className="font-medium text-sm">{formData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">CPF:</p>
                          <p className="font-medium text-sm">{formData.cpf}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">E-mail:</p>
                          <p className="font-medium text-sm break-all">{formData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Telefone:</p>
                          <p className="font-medium text-sm">{formData.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: QR Code */}
                    <div className="flex flex-col items-center justify-center order-1 md:order-2">
                      <div className="w-40 h-40 bg-white rounded flex items-center justify-center border-2 border-[#E8DCC4] p-2 mb-1">
                        {registrationId ? (
                          <QRCodeSVG
                            value={registrationId}
                            size={150}
                            level="H"
                            includeMargin={false}
                            fgColor="#B8860B"
                            bgColor="#FFFFFF"
                          />
                        ) : (
                          <QrCode className="w-16 h-16 text-[#B8860B]" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 text-center leading-tight">
                        Apresente na entrada
                      </p>
                    </div>
                  </div>

                  {/* Informações do Evento */}
                  <div className="border-t border-[#E8DCC4] pt-3 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Data:</p>
                          <p className="font-medium text-sm">{formatDate(event.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Horário:</p>
                          <p className="font-medium text-sm">09h00</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Local:</p>
                          <p className="font-medium text-sm">{event.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ID do Ingresso */}
                  <div className="border-t border-[#E8DCC4] pt-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-500 mb-0.5">ID do Ingresso:</p>
                        <p className="font-mono text-sm text-[#B8860B] font-bold break-all">
                          {registrationId || 'N/A'}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Emitido: {formatDateTime(new Date().toISOString())}
                      </p>
                    </div>
                  </div>
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
