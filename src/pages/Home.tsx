import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import Loading from '../components/Loading';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentEvent, loadEvent, loading } = useEvent();
  
  // Para fins de demonstração, vamos usar um evento fixo
  // Em produção, você pode carregar de uma lista ou usar um ID específico
  const eventId = '1'; // ID do evento a ser carregado

  useEffect(() => {
    loadEvent(eventId);
  }, []);

  if (loading) {
    return <Loading />;
  }

  // Dados de exemplo caso não haja evento carregado
  const event = currentEvent || {
    id: '1',
    title: 'Retiro Espiritual 2026',
    description: 'Venha viver três dias de renovação espiritual, louvor e adoração. Um tempo especial de comunhão com Deus e com nossos irmãos em Cristo. Inclui alimentação completa, hospedagem e todas as atividades programadas.',
    date: '2026-03-15T09:00:00',
    location: 'Centro de Retiros Nova Vida - Serra da Mantiqueira, MG',
    price: 350.00,
    image_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
    max_participants: 100,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
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
    <div className="home">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div 
          className="hero-image"
          style={{ backgroundImage: `url(${event.image_url})` }}
        ></div>
        <div className="hero-content">
          <h1 className="hero-title">{event.title}</h1>
          <p className="hero-subtitle">Uma experiência transformadora de fé e comunhão</p>
          <button 
            className="cta-button"
            onClick={() => navigate('/inscricao')}
          >
            Faça sua inscrição
          </button>
        </div>
      </section>

      <section className="event-details">
        <div className="container">
          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-icon">📅</div>
              <h3>Data do Evento</h3>
              <p>{formatDate(event.date)}</p>
            </div>

            <div className="detail-card">
              <div className="detail-icon">📍</div>
              <h3>Local</h3>
              <p>{event.location}</p>
            </div>

            <div className="detail-card">
              <div className="detail-icon">💰</div>
              <h3>Investimento</h3>
              <p className="price">{formatPrice(event.price)}</p>
              <small>Inclui hospedagem e alimentação</small>
            </div>
          </div>

          <div className="description-section">
            <h2>Sobre o Evento</h2>
            <p className="description">{event.description}</p>
          </div>

          <div className="features">
            <h2>O que está incluído</h2>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">🛏️</span>
                <span>Hospedagem Completa</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🍽️</span>
                <span>Alimentação Incluída</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎵</span>
                <span>Momentos de Louvor</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📖</span>
                <span>Estudos Bíblicos</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🙏</span>
                <span>Tempo de Oração</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Comunhão Fraterna</span>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <h2>Garanta sua vaga!</h2>
            <p>Vagas limitadas. Não perca essa oportunidade de renovar sua fé.</p>
            <button 
              className="cta-button large"
              onClick={() => navigate('/inscricao')}
            >
              Inscrever-se agora
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
