import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegistration } from '../contexts/RegistrationContext';
import { useEvent } from '../contexts/EventContext';
import type { Registration } from '../types';
import { api } from '../services/apiSelector';
import Loading from '../components/Loading';
import './Confirmation.css';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registrationId, formData, resetRegistration } = useRegistration();
  const { currentEvent } = useEvent();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef<HTMLDivElement>(null);

  const regId = searchParams.get('id') || registrationId;

  useEffect(() => {
    loadRegistration();
  }, [regId]);

  const loadRegistration = async () => {
    if (!regId) {
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const registrations = await api.getRegistrations();
      const found = registrations.find(r => r.id === regId);
      
      if (found) {
        setRegistration(found);
      } else {
        // Se não encontrou, usar dados do contexto
        if (formData.name) {
          setRegistration({
            id: regId,
            ...formData,
            payment_status: 'approved',
            checked_in: false,
            created_at: new Date().toISOString(),
          } as Registration);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar inscrição:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simula download do ticket
    alert('Funcionalidade de download será implementada em breve!');
  };

  const handleNewRegistration = () => {
    resetRegistration();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
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

  if (loading) {
    return <Loading />;
  }

  if (!registration) {
    return (
      <div className="confirmation">
        <div className="error-container">
          <h1>❌ Inscrição não encontrada</h1>
          <p>Não foi possível encontrar os dados da inscrição.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  const event = currentEvent || {
    title: 'Retiro Espiritual 2026',
    date: '2026-03-15T09:00:00',
    location: 'Centro de Retiros Nova Vida - Serra da Mantiqueira, MG',
    price: 350.00,
  };

  // Gerar "QR Code" simples (texto) - usado para validação futura
  // const qrCodeData = `REG-${registration.id}-${registration.email}`;

  return (
    <div className="confirmation">
      <div className="confirmation-container">
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h1>Inscrição Confirmada!</h1>
          <p className="success-message">
            Parabéns! Sua inscrição foi realizada com sucesso.
          </p>
        </div>

        <div className="ticket-wrapper" ref={ticketRef}>
          <div className="ticket">
            {/* Header do Ticket */}
            <div className="ticket-header">
              <div className="ticket-logo">
                <span className="logo-icon">✝</span>
                <span className="logo-text">Igreja</span>
              </div>
              <div className="ticket-type">INGRESSO</div>
            </div>

            {/* Informações do Evento */}
            <div className="ticket-event">
              <h2 className="event-title">{event.title}</h2>
              <div className="event-details">
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <div className="detail-info">
                    <span className="detail-label">Data e Hora</span>
                    <span className="detail-value">{formatDate(event.date)}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">📍</span>
                  <div className="detail-info">
                    <span className="detail-label">Local</span>
                    <span className="detail-value">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linha divisória */}
            <div className="ticket-divider">
              <div className="divider-circle left"></div>
              <div className="divider-line"></div>
              <div className="divider-circle right"></div>
            </div>

            {/* Informações do Participante */}
            <div className="ticket-participant">
              <div className="participant-info">
                <div className="info-group">
                  <span className="info-label">Nome do Participante</span>
                  <span className="info-value">{registration.name}</span>
                </div>
                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">Email</span>
                    <span className="info-value">{registration.email}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Telefone</span>
                    <span className="info-value">{registration.phone}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-group">
                    <span className="info-label">CPF</span>
                    <span className="info-value">{registration.cpf}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Valor Pago</span>
                    <span className="info-value price">{formatPrice(event.price)}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="ticket-qrcode">
                <div className="qrcode-placeholder">
                  <svg viewBox="0 0 100 100" width="120" height="120">
                    <rect width="100" height="100" fill="white"/>
                    <g fill="#d4af37">
                      <rect x="5" y="5" width="15" height="15"/>
                      <rect x="25" y="5" width="5" height="5"/>
                      <rect x="35" y="5" width="10" height="10"/>
                      <rect x="50" y="5" width="5" height="15"/>
                      <rect x="60" y="5" width="15" height="5"/>
                      <rect x="80" y="5" width="15" height="15"/>
                      
                      <rect x="5" y="25" width="5" height="5"/>
                      <rect x="15" y="25" width="5" height="5"/>
                      <rect x="25" y="25" width="10" height="10"/>
                      <rect x="40" y="25" width="5" height="5"/>
                      <rect x="50" y="25" width="15" height="5"/>
                      <rect x="70" y="25" width="5" height="10"/>
                      <rect x="80" y="25" width="5" height="5"/>
                      <rect x="90" y="25" width="5" height="5"/>
                      
                      <rect x="5" y="40" width="10" height="10"/>
                      <rect x="20" y="40" width="5" height="5"/>
                      <rect x="30" y="40" width="15" height="5"/>
                      <rect x="50" y="40" width="5" height="10"/>
                      <rect x="60" y="40" width="10" height="5"/>
                      <rect x="75" y="40" width="5" height="10"/>
                      <rect x="85" y="40" width="10" height="10"/>
                      
                      <rect x="5" y="55" width="5" height="10"/>
                      <rect x="15" y="55" width="10" height="5"/>
                      <rect x="30" y="55" width="5" height="15"/>
                      <rect x="40" y="55" width="10" height="5"/>
                      <rect x="55" y="55" width="5" height="10"/>
                      <rect x="65" y="55" width="15" height="5"/>
                      <rect x="85" y="55" width="5" height="10"/>
                      
                      <rect x="5" y="70" width="5" height="5"/>
                      <rect x="15" y="70" width="10" height="10"/>
                      <rect x="30" y="70" width="5" height="5"/>
                      <rect x="40" y="70" width="15" height="10"/>
                      <rect x="60" y="70" width="5" height="5"/>
                      <rect x="70" y="70" width="10" height="10"/>
                      <rect x="85" y="70" width="5" height="5"/>
                      <rect x="95" y="70" width="5" height="10"/>
                      
                      <rect x="5" y="80" width="15" height="15"/>
                      <rect x="25" y="80" width="10" height="5"/>
                      <rect x="40" y="80" width="5" height="15"/>
                      <rect x="50" y="80" width="15" height="5"/>
                      <rect x="70" y="80" width="5" height="15"/>
                      <rect x="80" y="80" width="15" height="15"/>
                    </g>
                  </svg>
                </div>
                <span className="qrcode-label">Código de Verificação</span>
              </div>
            </div>

            {/* Footer do Ticket */}
            <div className="ticket-footer">
              <div className="ticket-code">
                <span className="code-label">Código da Inscrição:</span>
                <span className="code-value">{registration.id}</span>
              </div>
              <div className="ticket-status">
                <span className={`status-badge ${registration.payment_status}`}>
                  {registration.payment_status === 'approved' && '✓ Pagamento Confirmado'}
                  {registration.payment_status === 'pending' && '⏱ Aguardando Pagamento'}
                  {registration.payment_status === 'rejected' && '✗ Pagamento Rejeitado'}
                </span>
              </div>
            </div>
          </div>

          {/* Linha perfurada */}
          <div className="ticket-perforation">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="perforation-hole"></div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="confirmation-actions">
          <button className="btn-secondary" onClick={handlePrint}>
            🖨️ Imprimir Ingresso
          </button>
          <button className="btn-secondary" onClick={handleDownload}>
            💾 Baixar PDF
          </button>
          <button className="btn-primary" onClick={handleNewRegistration}>
            ➕ Nova Inscrição
          </button>
        </div>

        {/* Informações Importantes */}
        <div className="important-info">
          <h3>📋 Informações Importantes</h3>
          <ul>
            <li>Guarde este ingresso. Ele será necessário para fazer o check-in no evento.</li>
            <li>Apresente o código QR ou o código de inscrição na entrada.</li>
            <li>Em caso de dúvidas, entre em contato através do email: contato@igreja.com</li>
            <li>Chegue com pelo menos 30 minutos de antecedência.</li>
            <li>Você receberá um email de confirmação em breve.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
