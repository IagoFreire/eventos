import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../contexts/RegistrationContext';
import { useEvent } from '../contexts/EventContext';
import { api } from '../services/apiSelector';
import './Registration.css';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { formData, setFormData, currentStep, setCurrentStep, setRegistrationId } = useRegistration();
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
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf || !formData.address) {
      setError('Por favor, preencha todos os campos');
      return false;
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }

    // Validação simples de CPF (apenas formato)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.cpf)) {
      setError('CPF deve estar no formato: 000.000.000-00');
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
          // Criar inscrição no backend
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
    setLoading(true);
    try {
      // Aqui você integraria com o Mercado Pago
      // Por enquanto, simulamos o pagamento
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
      
      // Redirecionar para confirmação ou mostrar QR Code do PIX
      alert('Pagamento criado com sucesso! ID: ' + payment.id);
      navigate('/');
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
    <div className="registration">
      <div className="registration-container">
        <h1 className="registration-title">Inscrição para o Evento</h1>
        
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Dados Pessoais</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Pagamento</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {currentStep === 1 && (
          <div className="form-step">
            <h2>Dados Pessoais</h2>
            <form className="registration-form">
              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Telefone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cpf">CPF *</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Endereço Completo *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, bairro, cidade, estado"
                  rows={3}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/')}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Próximo'}
                </button>
              </div>
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <h2>Pagamento e Confirmação</h2>
            
            <div className="summary-card">
              <h3>Resumo da Inscrição</h3>
              <div className="summary-item">
                <span>Nome:</span>
                <strong>{formData.name}</strong>
              </div>
              <div className="summary-item">
                <span>Email:</span>
                <strong>{formData.email}</strong>
              </div>
              <div className="summary-item">
                <span>Telefone:</span>
                <strong>{formData.phone}</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item total">
                <span>Valor Total:</span>
                <strong className="price">{formatPrice(event.price)}</strong>
              </div>
            </div>

            <div className="payment-options">
              <h3>Escolha a forma de pagamento</h3>
              <div className="payment-methods">
                <div className="payment-method">
                  <input type="radio" id="pix" name="payment" defaultChecked />
                  <label htmlFor="pix">
                    <span className="payment-icon">📱</span>
                    <span>PIX</span>
                  </label>
                </div>
                <div className="payment-method">
                  <input type="radio" id="credit" name="payment" />
                  <label htmlFor="credit">
                    <span className="payment-icon">💳</span>
                    <span>Cartão de Crédito</span>
                  </label>
                </div>
                <div className="payment-method">
                  <input type="radio" id="boleto" name="payment" />
                  <label htmlFor="boleto">
                    <span className="payment-icon">📄</span>
                    <span>Boleto</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePreviousStep}
                disabled={loading}
              >
                Voltar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;
