import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import { useSettings } from '../contexts/SettingsContext';
import { MapPin, Calendar, Clock, DollarSign, Users, ChevronRight, AlertCircle } from 'lucide-react';
import Loading from '../components/Loading';
import { api } from '../services/apiSelector';
import { formatPrice } from '../utils/formatPrice';

interface EventStats {
  event_id: string;
  total_registrations: number;
  approved_registrations: number;
  max_participants: number;
  available_spots: number | null;
  percentage_filled: number;
  is_full: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentEvent, loading } = useEvent();
  const { settings, loading: loadingSettings } = useSettings();
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (currentEvent) {
      loadEventStats();
    }
  }, [currentEvent]);

  const loadEventStats = async () => {
    if (!currentEvent) return;
    
    setLoadingStats(true);
    try {
      const statsData = await api.getEventStats(currentEvent.id);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingSettings) {
    return <Loading />;
  }

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

  const eventSettings = settings || {
    id: 'default',
    event_id: '1',
    event_subtitle: 'Evento Especial 2026',
    event_time: '09h00 - Início das atividades',
    included_items: [
      { icon: '🛏️', title: 'Hospedagem Completa', description: 'Acomodações confortáveis' },
      { icon: '🍽️', title: 'Alimentação Incluída', description: 'Todas as refeições' },
      { icon: '🎵', title: 'Momentos de Louvor', description: 'Adoração e música' },
      { icon: '📖', title: 'Estudos Bíblicos', description: 'Aprofundamento espiritual' },
      { icon: '🙏', title: 'Tempo de Oração', description: 'Momentos de intercessão' },
      { icon: '👥', title: 'Comunhão Fraterna', description: 'Conexão com irmãos' },
    ],
    church_name: 'Igreja Evangélica',
    church_contact_phone: '(11) 98765-4321',
    church_contact_email: 'contato@igreja.com.br',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {eventSettings.event_subtitle && (
            <div className="inline-block mb-6 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-[#D4AF37]">
              <span className="text-[#B8860B]">{eventSettings.event_subtitle}</span>
            </div>
          )}
          <h1 className="text-5xl md:text-6xl mb-6 text-gray-800 font-bold">
            {event.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {event.description}
          </p>
          {stats?.is_full ? (
            <div className="inline-flex items-center gap-2 bg-gray-400 text-white px-8 py-4 rounded-full cursor-not-allowed">
              <AlertCircle className="w-5 h-5" />
              <span className="text-lg">Vagas Esgotadas</span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/inscricao')}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-8 py-4 rounded-full hover:shadow-lg hover:scale-105 transition-all"
            >
              <span className="text-lg">Fazer Inscrição</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Date & Time Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-gray-800">Data e Horário</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#B8860B]" />
                  <span>{formatDate(event.date)}</span>
                </div>
                {eventSettings.event_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#B8860B]" />
                    <span>{eventSettings.event_time}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-gray-800">Localização</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#B8860B] mt-1 flex-shrink-0" />
                  <div>
                    <p>{event.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-gray-800">Investimento</h3>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl text-[#B8860B]">{formatPrice(event.price)}</span>
                  <span className="text-gray-500">/pessoa</span>
                </div>
                <p className="text-sm text-gray-600">
                  Inclui: Hospedagem, alimentação completa e material de apoio
                </p>
              </div>
            </div>

            {/* Capacity Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-gray-800">Vagas Limitadas</h3>
              <div className="space-y-3">
                {loadingStats ? (
                  <p className="text-gray-600">Carregando...</p>
                ) : stats ? (
                  <>
                    {stats.is_full ? (
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Vagas Esgotadas!</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600">
                          {stats.available_spots !== null 
                            ? `${stats.available_spots} de ${stats.max_participants} vagas disponíveis`
                            : `${stats.approved_registrations} inscrições confirmadas`
                          }
                        </p>
                        <div className="bg-[#F5F5DC] rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] transition-all duration-500"
                            style={{ width: `${stats.percentage_filled}%` }}
                          />
                        </div>
                        <p className="text-sm text-[#B8860B]">
                          {stats.percentage_filled}% das vagas preenchidas
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">Apenas {event.max_participants} vagas disponíveis</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl text-center mb-12 text-gray-800">O que está incluído</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {eventSettings.included_items.map((item, index) => (
              <div key={index} className="bg-white/80 rounded-xl p-6 border border-[#E8DCC4] text-center">
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl mb-6 text-gray-800">
            Não Perca Esta Oportunidade
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Garanta sua vaga agora e prepare seu coração para dias de transformação
          </p>
          {stats?.is_full ? (
            <div className="inline-flex items-center gap-2 bg-gray-400 text-white px-8 py-4 rounded-full cursor-not-allowed">
              <AlertCircle className="w-5 h-5" />
              <span className="text-lg">Vagas Esgotadas</span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/inscricao')}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-8 py-4 rounded-full hover:shadow-lg hover:scale-105 transition-all"
            >
              <span className="text-lg">Fazer Inscrição Agora</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
