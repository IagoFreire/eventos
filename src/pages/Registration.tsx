import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import { useRegistration } from '../contexts/RegistrationContext';
import { useEvent } from '../contexts/EventContext';
import { useSettings } from '../contexts/SettingsContext';
import { api } from '../services/apiSelector';
import type { RegistrationQuestion, RegistrationAnswer } from '../types';
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, Calendar, CheckCircle, Download, Printer, MapPin, Clock, QrCode, Home, CreditCard, MessageCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PixPayment from '../components/PixPayment';
import CreditCardPayment from '../components/CreditCardPayment';
import { formatPrice } from '../utils/formatPrice';
import { publicKey } from '../services/mercadopago-config';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { formData, setFormData, currentStep, setCurrentStep, registrationId, setRegistrationId } = useRegistration();
  const { currentEvent } = useEvent();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pixData, setPixData] = useState<any>(null);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [showCreditCardPayment, setShowCreditCardPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const ticketRef = useRef<HTMLDivElement>(null);
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string | string[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const isCheckingPaymentRef = useRef(false);
  const lastErrorMessageRef = useRef<string>('');
  const paymentConfirmedRef = useRef(false); // Evitar mensagens duplicadas
  const [showWhatsAppContact, setShowWhatsAppContact] = useState(false);

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

  // Carregar perguntas quando o componente montar
  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const loadedQuestions = await api.getRegistrationQuestions(event.id);
        setQuestions(loadedQuestions);
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
        // Não é crítico se não conseguir carregar perguntas
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, [event.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    // Validar perguntas obrigatórias
    for (const question of questions) {
      if (question.is_required) {
        const answer = questionAnswers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'string' && answer.trim() === '')) {
          setError(`Por favor, responda a pergunta: ${question.question_text}`);
          return false;
        }
      }
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
          // Preparar respostas das perguntas
          const answers: Omit<RegistrationAnswer, 'id' | 'registration_id' | 'created_at' | 'updated_at'>[] = questions
            .filter(q => questionAnswers[q.id] !== undefined)
            .map(question => {
              const answer = questionAnswers[question.id];
              if (question.question_type === 'text') {
                return {
                  question_id: question.id,
                  answer_text: typeof answer === 'string' ? answer : '',
                  answer_options: []
                };
              } else if (question.question_type === 'single_choice') {
                return {
                  question_id: question.id,
                  answer_text: typeof answer === 'string' ? answer : '',
                  answer_options: []
                };
              } else {
                // multiple_choice
                return {
                  question_id: question.id,
                  answer_text: undefined,
                  answer_options: Array.isArray(answer) ? answer : []
                };
              }
            });

          const registration = await api.createRegistration({
            ...formData,
            event_id: event.id,
          }, answers);
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
    setShowWhatsAppContact(false); // Resetar estado ao voltar
  };

  const handlePayment = async () => {
    if (!registrationId) {
      const errorMsg = 'ID de inscrição não encontrado. Por favor, reinicie o processo.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Atualizar selected_payment_method quando o usuário confirma o pagamento
    try {
      await api.updateRegistration(registrationId, { selected_payment_method: paymentMethod });
    } catch (err: any) {
      // Não bloquear o fluxo se falhar, apenas logar o erro
      console.error('Erro ao salvar método de pagamento selecionado:', err);
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

  // Callback para pagamento com cartão aprovado
  // Diferente do PIX, o cartão já retorna o status imediatamente
  const handleCreditCardPaymentSuccess = async () => {
    if (!registrationId) {
      toast.error('ID de inscrição não encontrado.');
      return;
    }

    try {
      // Garantir que selected_payment_method está salvo
      if (paymentMethod) {
        try {
          await api.updateRegistration(registrationId, { selected_payment_method: paymentMethod });
        } catch (err: any) {
          console.error('Erro ao salvar método de pagamento selecionado:', err);
        }
      }

      // Atualizar status da inscrição para aprovado
      await api.updateRegistration(registrationId, {
        payment_status: 'approved'
      });

      toast.success('✅ Pagamento confirmado com sucesso!');
      setCurrentStep(3);
    } catch (error: any) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      // Mesmo com erro, avançar (webhook pode ter atualizado)
      toast.success('✅ Pagamento confirmado com sucesso!');
      setCurrentStep(3);
    }
  };

  // Verificar e confirmar pagamento real (usado pelo polling automático do PIX)
  const handlePixPaymentConfirmed = async () => {
    if (!registrationId) {
      toast.error('ID de inscrição não encontrado.');
      return;
    }

    // Evitar múltiplas verificações simultâneas e mensagens duplicadas
    if (isCheckingPaymentRef.current || paymentConfirmedRef.current) {
      return;
    }

    // Detectar se está em produção (chave pública não começa com TEST-)
    const isProduction = publicKey && !publicKey.startsWith('TEST-') && publicKey.startsWith('APP_USR-');

    isCheckingPaymentRef.current = true;
    setLoading(true);

    try {
      // Tentar verificar até 3 vezes com delay (para dar tempo ao webhook atualizar)
      let attempts = 0;
      const maxAttempts = 3;
      let registration;

      while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔍 Verificando status no banco de dados (tentativa ${attempts}/${maxAttempts})...`);
        
        // Usar rota pública específica para verificação de pagamento (com logs detalhados)
        registration = await api.checkPaymentStatus(registrationId);

        // Se já estiver aprovado no banco, avançar imediatamente
        if (registration.payment_status === 'approved') {
          // Garantir que selected_payment_method está salvo
          if (paymentMethod && !registration.selected_payment_method) {
            try {
              await api.updateRegistration(registrationId, { selected_payment_method: paymentMethod });
            } catch (err: any) {
              console.error('Erro ao salvar método de pagamento selecionado:', err);
            }
          }

          // Evitar mensagem duplicada
          if (!paymentConfirmedRef.current) {
            console.log('✅ Pagamento já está aprovado no banco de dados');
            toast.success('✅ Pagamento confirmado com sucesso!');
            paymentConfirmedRef.current = true;
          }
          setShowWhatsAppContact(false); // Esconder mensagem de WhatsApp se pagamento foi confirmado
          setCurrentStep(3);
          setLoading(false);
          isCheckingPaymentRef.current = false;
          return;
        }

        // Se não for a última tentativa, aguardar um pouco antes de tentar novamente
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2 segundos
        }
      }

      // Se após todas as tentativas ainda não estiver aprovado
      // Mostrar opção de contato via WhatsApp
      setShowWhatsAppContact(true);
      toast.info('⏳ Pagamento ainda não foi confirmado. Você pode enviar o comprovante pelo WhatsApp.', {
        autoClose: 8000,
      });
    } catch (error: any) {
      console.error('❌ Erro ao verificar pagamento:', error);
      console.error('📋 Detalhes do erro:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        code: error?.code,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
        }
      });

      // Verificar se é erro de CORS ou rede
      const isCorsError = error?.code === 'ERR_NETWORK' || 
                         error?.message?.includes('CORS') || 
                         error?.message?.includes('Network Error') ||
                         !error?.response;

      // Evitar mostrar a mesma mensagem repetidamente
      const errorMessage = error?.message || 'Erro desconhecido';
      if (lastErrorMessageRef.current === errorMessage) {
        // Mesma mensagem de erro - não mostrar novamente
        setLoading(false);
        isCheckingPaymentRef.current = false;
        return;
      }
      lastErrorMessageRef.current = errorMessage;

      // Mensagem específica para erros de CORS/rede
      if (isCorsError) {
        toast.error('❌ Erro de conexão. Verifique sua internet e tente novamente. Se o problema persistir, pode ser um problema de configuração do servidor.', {
          autoClose: 10000,
        });
        console.error('🚨 Erro de CORS/Rede detectado - verifique configuração do servidor');
      } else if (error?.response?.status === 403) {
        toast.error('❌ Acesso negado. Verifique as configurações de CORS do servidor.', {
          autoClose: 10000,
        });
      } else {
        // Em produção, mostrar opção de contato via WhatsApp
        if (isProduction) {
          setShowWhatsAppContact(true);
          toast.info('⏳ O sistema está verificando o pagamento automaticamente. Se você já pagou, pode enviar o comprovante pelo WhatsApp.', {
            autoClose: 8000,
          });
        } else {
          // Em desenvolvimento/teste, oferece opção de confirmar manualmente
          const shouldProceed = window.confirm(
            'Não foi possível verificar o status do pagamento automaticamente. ' +
            'Deseja confirmar manualmente? (Use apenas em modo de teste)'
          );

          if (shouldProceed) {
            try {
              await api.updateRegistration(registrationId, {
                payment_status: 'approved'
              });
              toast.warning('⚠️ Pagamento confirmado manualmente (modo de teste)');
              setCurrentStep(3);
            } catch (updateError) {
              toast.error('Erro ao confirmar pagamento. Tente novamente.');
            }
          }
        }
      }
    } finally {
      setLoading(false);
      isCheckingPaymentRef.current = false;
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
      event_id: '',
    });
    setRegistrationId(null);
    paymentConfirmedRef.current = false; // Resetar flag de confirmação
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

  // Formatar número de WhatsApp (remover caracteres especiais e adicionar código do país se necessário)
  const formatPhoneForWhatsApp = (phone: string): string => {
    if (!phone) return '';
    
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Se o número começar com 0, remove (ex: 011 vira 11)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return cleaned;
  };

  // Abrir WhatsApp com mensagem pré-formatada
  const openWhatsApp = () => {
    // Buscar telefone marcado para suporte PIX, ou usar o primeiro disponível
    const pixSupportPhone = settings?.contact_phones?.find(cp => cp.use_for_pix_support);
    const churchPhone = pixSupportPhone?.phone || settings?.contact_phones?.[0]?.phone || settings?.church_contact_phone;
    
    if (!churchPhone) {
      toast.error('WhatsApp de contato não configurado. Entre em contato com a administração.');
      return;
    }

    const formattedPhone = formatPhoneForWhatsApp(churchPhone);
    const message = encodeURIComponent(
      `Olá! Realizei o pagamento PIX para o evento "${event.title}" mas não consegui confirmar no sistema.\n\n` +
      `Por favor, posso enviar o comprovante?\n\n` +
      `Meu nome: ${formData.name}\n` +
      `CPF: ${formData.cpf}\n` +
      `Email: ${formData.email}`
    );
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className={`hidden sm:inline ${currentStep >= 1 ? 'text-gray-800' : 'text-gray-500'}`}>Dados</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 rounded">
              <div
                className={`h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded transition-all ${currentStep >= 2 ? 'w-full' : 'w-0'
                  }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className={`hidden sm:inline ${currentStep >= 2 ? 'text-gray-800' : 'text-gray-500'}`}>Pagamento</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 rounded">
              <div
                className={`h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded transition-all ${currentStep >= 3 ? 'w-full' : 'w-0'
                  }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white' : 'bg-gray-300 text-gray-600'
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
              <h2 className="text-2xl text-gray-800 mb-2">Informações Pessoais</h2>

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
                  WhatsApp*
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
                <label className="block text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                  placeholder="000.000.000-00"
                />
              </div>

              {/* Perguntas Dinâmicas */}
              {(loadingQuestions || questions.length > 0) && (
                <div className="mt-8 pt-6 border-t border-[#E8DCC4]">
                  <h3 className="text-xl text-gray-800 mb-4">Perguntas Adicionais</h3>
                  {loadingQuestions ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 text-sm">Carregando perguntas...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        <label className="block text-gray-700 mb-2">
                          {question.question_text}
                          {question.is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {question.question_type === 'text' && (
                          <input
                            type="text"
                            value={questionAnswers[question.id] as string || ''}
                            onChange={(e) => {
                              setQuestionAnswers({
                                ...questionAnswers,
                                [question.id]: e.target.value
                              });
                            }}
                            className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                            placeholder="Digite sua resposta..."
                          />
                        )}

                        {question.question_type === 'single_choice' && (
                          <div className="space-y-2">
                            {question.options.map((option, index) => (
                              <label key={index} className="flex items-center gap-3 p-3 border border-[#E8DCC4] rounded-lg hover:bg-[#F5F5DC]/30 cursor-pointer min-w-0">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={option}
                                  checked={questionAnswers[question.id] === option}
                                  onChange={(e) => {
                                    setQuestionAnswers({
                                      ...questionAnswers,
                                      [question.id]: e.target.value
                                    });
                                  }}
                                  className="w-4 h-4 text-[#D4AF37] border-[#E8DCC4] focus:ring-[#D4AF37] flex-shrink-0"
                                />
                                <span className="text-gray-700 break-words min-w-0 flex-1">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.question_type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {question.options.map((option, index) => (
                              <label key={index} className="flex items-center gap-3 p-3 border border-[#E8DCC4] rounded-lg hover:bg-[#F5F5DC]/30 cursor-pointer min-w-0">
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={(questionAnswers[question.id] as string[] || []).includes(option)}
                                  onChange={(e) => {
                                    const currentAnswers = (questionAnswers[question.id] as string[] || []);
                                    const newAnswers = e.target.checked
                                      ? [...currentAnswers, option]
                                      : currentAnswers.filter(a => a !== option);
                                    setQuestionAnswers({
                                      ...questionAnswers,
                                      [question.id]: newAnswers
                                    });
                                  }}
                                  className="w-4 h-4 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] flex-shrink-0"
                                />
                                <span className="text-gray-700 break-words min-w-0 flex-1">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

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
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'pix'
                    ? 'border-[#D4AF37] bg-[#F5F5DC]'
                    : 'border-[#E8DCC4] hover:border-[#D4AF37]'
                    }`}
                  onClick={() => {
                    setPaymentMethod('pix');
                  }}
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
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'credit_card'
                    ? 'border-[#D4AF37] bg-[#F5F5DC]'
                    : 'border-[#E8DCC4] hover:border-[#D4AF37]'
                    }`}
                  onClick={() => {
                    setPaymentMethod('credit_card');
                  }}
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
                isTestMode={false} // Desabilitar modo teste para permitir polling automático
                registrationId={registrationId || undefined}
                checkRegistrationStatus={async (id: string) => {
                  // Verificar status da inscrição no banco de dados (atualizado pelo webhook)
                  try {
                    const registration = await api.getRegistrationById(id);
                    return registration;
                  } catch (error) {
                    console.error('Erro ao verificar inscrição:', error);
                    return null;
                  }
                }}
              />

              <div className="flex flex-col-reverse md:flex-row gap-4">
                <button
                  onClick={() => {
                    setShowPixPayment(false);
                    setShowWhatsAppContact(false); // Resetar estado ao voltar
                  }}
                  className="flex-1 border border-[#E8DCC4] text-gray-700 py-3 rounded-full hover:bg-white/50 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handlePixPaymentConfirmed}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12H4z"></path>
                      </svg>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Já Paguei</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Clique em "Já Paguei" após realizar o pagamento
              </p>

              {/* Mensagem de contato via WhatsApp quando não conseguir confirmar */}
              {showWhatsAppContact && (settings?.contact_phones?.find(cp => cp.use_for_pix_support)?.phone || settings?.contact_phones?.[0]?.phone || settings?.church_contact_phone) && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 mt-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-base md:text-lg font-semibold text-blue-900 mb-2">
                        Pagamento via WhatsApp com Comprovante
                      </h4>
                      <p className="text-sm md:text-base text-blue-800 mb-3 md:mb-4">
                        Se você já realizou o pagamento PIX mas o sistema não confirmou automaticamente, 
                        envie o comprovante pelo WhatsApp para confirmação manual do pagamento.
                      </p>
                      <button
                        onClick={openWhatsApp}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full transition-all shadow-md"
                      >
                        <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                        <span>WhatsApp</span>
                      </button>
                      <p className="text-blue-600 text-xs md:text-sm mt-2 md:mt-3">
                        📱 WhatsApp: {settings?.contact_phones?.find(cp => cp.use_for_pix_support)?.phone || settings?.contact_phones?.[0]?.phone || settings?.church_contact_phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && showCreditCardPayment && (
            <CreditCardPayment
              amount={event.price}
              registrationId={registrationId || ''}
              onPaymentSuccess={handleCreditCardPaymentSuccess}
              onCancel={() => setShowCreditCardPayment(false)}
              payerEmail={formData.email}
              payerCpf={formData.cpf}
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
                          <p className="text-sm text-gray-500">WhatsApp:</p>
                          <p className="font-medium text-sm">{formData.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: QR Code */}
                    <div className="flex flex-col items-center justify-center order-1 md:order-2">
                      <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded flex items-center justify-center border-2 border-[#E8DCC4] p-2 mb-1 aspect-square">
                        {registrationId ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <QRCodeSVG
                              value={registrationId}
                              size={120}
                              level="H"
                              includeMargin={false}
                              fgColor="#B8860B"
                              bgColor="#FFFFFF"
                            />
                          </div>
                        ) : (
                          <QrCode className="w-12 h-12 md:w-16 md:h-16 text-[#B8860B]" />
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
