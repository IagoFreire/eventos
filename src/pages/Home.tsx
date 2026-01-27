import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import { useSettings } from '../contexts/SettingsContext';
import { MapPin, Calendar, Clock, DollarSign, Users, ChevronRight, AlertCircle, Sparkles, Star, CheckCircle, ExternalLink, Instagram } from 'lucide-react';
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
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
    church_name: 'Igreja',
    church_contact_phone: '(11) 98765-4321',
    church_contact_email: 'contato@igreja.com.br',
    show_included_items: true,
    show_confirmed_participants: true,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Formatar múltiplas datas no formato "Dias: 21, 22 e 23 de fev"
  const formatDatesList = (dates: { date: string }[]) => {
    if (dates.length === 0) return '';
    
    // Converter e ordenar todas as datas primeiro
    const sortedDates = dates
      .map(item => new Date(item.date))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (sortedDates.length === 1) {
      const date = sortedDates[0];
      const day = date.getUTCDate();
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      return `Dia: ${day} de ${month}`;
    }

    // Agrupar por mês/ano (já ordenadas)
    const grouped = sortedDates.reduce((acc, date) => {
      const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(date);
      return acc;
    }, {} as Record<string, Date[]>);

    // Formatar cada grupo (já estão ordenados por data)
    const formattedGroups = Object.keys(grouped)
      .sort() // Ordenar as chaves (ano-mês) para manter ordem cronológica
      .map(key => {
        const group = grouped[key];
        const days = group.map(d => d.getUTCDate());
        const month = group[0].toLocaleDateString('pt-BR', { month: 'short' });
        
        if (days.length === 1) {
          return `${days[0]} de ${month}`;
        } else if (days.length === 2) {
          return `${days[0]} e ${days[1]} de ${month}`;
        } else {
          // Para mais de 2 dias: "21, 22 e 23 de fev"
          const lastDay = days.pop();
          return `${days.join(', ')} e ${lastDay} de ${month}`;
        }
      });

    return `Dias: ${formattedGroups.join(', ')}`;
  };

  // Obter datas do evento (usar dates se disponível, senão usar date)
  const eventDatesList = currentEvent?.dates && currentEvent.dates.length > 0
    ? currentEvent.dates
    : currentEvent?.date
    ? [{ id: 'default', event_id: currentEvent.id, date: currentEvent.date }]
    : [];


  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4"
        style={{
          backgroundImage: eventSettings.event_title_background_image_url 
            ? `url(${eventSettings.event_title_background_image_url})` 
            : undefined,
          backgroundSize: eventSettings.event_title_background_image_url ? 'cover' : undefined,
          backgroundPosition: eventSettings.event_title_background_image_url ? 'center' : undefined,
          backgroundRepeat: eventSettings.event_title_background_image_url ? 'no-repeat' : undefined,
        }}
      >
        {/* Overlay escuro para melhorar legibilidade quando há background */}
        {eventSettings.event_title_background_image_url && (
          <div className="absolute inset-0 bg-black/30 z-0"></div>
        )}
        
        <div className={`max-w-6xl mx-auto relative z-10 ${eventSettings.event_title_image_url ? 'grid md:grid-cols-2 gap-8 items-center' : 'max-w-4xl text-center'}`}>
          {/* Imagem à esquerda (quando disponível) */}
          {eventSettings.event_title_image_url && (
            <div className="flex justify-center md:justify-start order-1">
              <div className="w-full max-w-sm md:max-w-md h-56 md:h-80 flex items-center justify-center overflow-hidden">
                <img 
                  src={eventSettings.event_title_image_url} 
                  alt={event.title}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
            </div>
          )}
          
          {/* Conteúdo do título e informações */}
          <div className={`${eventSettings.event_title_image_url ? 'order-2' : ''} ${eventSettings.event_title_image_url ? '' : 'text-center'}`}>
            {eventSettings.event_subtitle && (
              <div className="inline-block mb-6 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-[#D4AF37] shadow-lg">
                <span 
                  className="font-semibold flex items-center gap-2"
                  style={{ 
                    color: eventSettings.event_title_text_color || '#B8860B',
                    fontWeight: eventSettings.event_title_font_weight || '600'
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  {eventSettings.event_subtitle}
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
            )}
            <h1 
              className={`text-5xl md:text-6xl mb-6 ${eventSettings.event_title_image_url ? 'text-left' : ''}`}
              style={{ 
                color: eventSettings.event_title_text_color || '#1f2937',
                fontWeight: eventSettings.event_title_font_weight || '700'
              }}
            >
              {event.title}
            </h1>
            <p 
              className={`text-xl mb-8 whitespace-pre-line ${eventSettings.event_title_image_url ? 'text-left' : 'max-w-2xl mx-auto'}`}
              style={{ 
                color: eventSettings.event_title_text_color || '#4b5563',
                fontWeight: eventSettings.event_title_font_weight || '400'
              }}
            >
              {event.description}
            </p>
            <div className={eventSettings.event_title_image_url ? 'flex justify-start' : 'flex justify-center'}>
              {stats?.is_full ? (
                <div className="inline-flex items-center gap-2 bg-gray-400 text-white px-8 py-4 rounded-full cursor-not-allowed">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-lg">Vagas Esgotadas</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/inscricao')}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full hover:shadow-lg hover:scale-105 transition-all"
                  style={{
                    backgroundColor: eventSettings.event_title_button_color || '#D4AF37',
                    color: eventSettings.event_title_button_text_color || '#ffffff',
                  }}
                >
                  <span className="text-lg">Fazer Inscrição</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

            {/* Confirmed Participants Section */}
            {eventSettings.show_confirmed_participants !== false && eventSettings.confirmed_participants && eventSettings.confirmed_participants.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-br from-[#2b1e15] via-[#1a1309] to-[#18110c] relative overflow-hidden">
          {/* Background decorativo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#B8860B]/5"></div>
            {[...Array(15)].map((_, i) => (
              <Star
                key={i}
                className="absolute w-2 h-2 text-[#D4AF37]/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="space-y-8">
              {eventSettings.confirmed_participants.map((participant, index) => {
                const handleParticipantClick = () => {
                  if (participant.instagram) {
                    let instagramUrl = participant.instagram.trim();
                    // Se começar com @, remover o @ e construir a URL
                    if (instagramUrl.startsWith('@')) {
                      instagramUrl = `https://instagram.com/${instagramUrl.substring(1)}`;
                    } else if (!instagramUrl.startsWith('http')) {
                      // Se não começar com http, assumir que é um username e construir a URL
                      instagramUrl = `https://instagram.com/${instagramUrl.replace('@', '')}`;
                    }
                    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
                  }
                };

                return (
                <div
                  key={index}
                  onClick={handleParticipantClick}
                  className={`bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:bg-white/15 hover:border-[#D4AF37]/50 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#D4AF37]/20 ${participant.instagram ? 'cursor-pointer' : ''}`}
                >
                  <div className="grid md:grid-cols-3 gap-8 items-center">
                    {/* Lado Esquerdo - Confirmado e Nome */}
                    <div className="flex flex-col">
                      <span className="text-[#D4AF37] text-sm font-semibold mb-2 uppercase tracking-wide flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Confirmado:
                      </span>
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                        {participant.name}
                        {participant.instagram && (
                          <span title="Clique para ver o Instagram">
                            <Instagram className="w-5 h-5 text-[#D4AF37]" />
                          </span>
                        )}
                      </h3>
                    </div>

                    {/* Meio - Espaço para Imagem */}
                    <div className="flex justify-center items-center">
                      {participant.image_url ? (
                        <div className="w-full max-w-xs h-64 flex items-center justify-center overflow-hidden rounded-xl">
                          <img 
                            src={participant.image_url} 
                            alt={participant.name}
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-xs h-64 border-2 border-dashed border-white/30 flex items-center justify-center rounded-xl hover:border-[#D4AF37]/50 transition-colors">
                          <span className="text-white/50 text-sm">Imagem do participante</span>
                        </div>
                      )}
                    </div>

                    {/* Lado Direito - Descrição */}
                    <div className="flex flex-col">
                      <div className="mb-4 pb-2 border-b border-white/20">
                        <span className="text-[#D4AF37] text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Sobre
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-base leading-relaxed whitespace-pre-line">
                          {participant.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Event Details */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Date & Time Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#E8DCC4] shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20 transform transition-all duration-500 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-gray-800 font-bold">
                {eventDatesList.length > 1 ? 'Datas e Horários' : 'Data e Horário'}
              </h3>
              <div className="space-y-3 text-gray-600">
                {eventDatesList.length > 0 ? (
                  <div className="flex items-center gap-2 group">
                    <Calendar className="w-5 h-5 text-[#B8860B] flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="font-medium">{formatDatesList(eventDatesList)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <Calendar className="w-5 h-5 text-[#B8860B] group-hover:scale-125 transition-transform" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                )}
                {eventSettings.event_time && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E8DCC4] group">
                    <Clock className="w-5 h-5 text-[#B8860B] group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium">{eventSettings.event_time}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#E8DCC4] shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20 transform transition-all duration-500 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-gray-800 font-bold">Localização</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start gap-2 group">
                  <MapPin className="w-5 h-5 text-[#B8860B] mt-1 flex-shrink-0 group-hover:scale-125 transition-transform" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#E8DCC4]">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-medium"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Abrir no Mapa</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Investment Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#E8DCC4] shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20 transform transition-all duration-500 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-gray-800 font-bold">Investimento</h3>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#B8860B] to-[#D4AF37] font-bold">
                    {formatPrice(event.price)}
                  </span>
                  <span className="text-gray-500">/pessoa</span>
                </div>
                <p className="text-sm text-gray-600">
                  Inclui: Hospedagem, alimentação completa e material de apoio
                </p>
              </div>
            </div>

            {/* Capacity Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#E8DCC4] shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20 transform transition-all duration-500 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-gray-800 font-bold">Vagas Limitadas</h3>
              <div className="space-y-3">
                {eventSettings.show_available_spots !== false ? (
                  <>
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
                            <p className="text-gray-600 font-medium">
                              {stats.available_spots !== null 
                                ? `${stats.available_spots} de ${stats.max_participants} vagas disponíveis`
                                : `${stats.approved_registrations} inscrições confirmadas`
                              }
                            </p>
                            <div className="bg-[#F5F5DC] rounded-full h-4 overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] transition-all duration-1000 relative"
                                style={{ width: `${stats.percentage_filled}%` }}
                              >
                              </div>
                            </div>
                            <p className="text-sm text-[#B8860B] font-semibold">
                              {stats.percentage_filled}% das vagas preenchidas
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600">Apenas {event.max_participants} vagas disponíveis</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">Vagas limitadas para este evento</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {eventSettings.show_included_items !== false && (
        <section className="py-16 px-4 bg-gradient-to-br from-white/60 via-[#F5F5DC]/40 to-white/60 backdrop-blur-sm relative overflow-hidden">
          {/* Background decorativo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#B8860B]/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-4xl text-center mb-12 text-gray-800 font-bold">
              <span className="bg-gradient-to-r from-[#B8860B] to-[#D4AF37] bg-clip-text text-transparent">
                O que está incluído
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {eventSettings.included_items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#E8DCC4] text-center shadow-lg hover:shadow-2xl hover:shadow-[#D4AF37]/20 transform transition-all duration-500 hover:-translate-y-2 hover:scale-105 group"
                >
                  <div className="relative inline-block mb-3">
                    <span className="text-5xl block transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                      {item.icon}
                    </span>
                    <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#B8860B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl mb-6 text-gray-800 font-bold">
            Não Perca Esta Oportunidade!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Garanta sua vaga agora para o evento
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
