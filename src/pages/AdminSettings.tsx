import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useEvent } from '../contexts/EventContext';
import { useSettings } from '../contexts/SettingsContext';
import type { Event, EventSettings, IncludedItem, EventDate, ConfirmedParticipant, RegistrationQuestion, ContactPhone } from '../types';
import { api } from '../services/apiSelector';
import { 
  ArrowLeft, 
  Save, 
  Settings as SettingsIcon,
  Users,
  Plus,
  Trash2,
  Church,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Globe,
  Sliders,
  CheckSquare,
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Loading from '../components/Loading';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { loadEvent, currentEvent, eventsLoaded } = useEvent();
  const { updateSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'event' | 'church' | 'included' | 'participants' | 'questions'>('event');
  
  // Estados para Event
  const [event, setEvent] = useState<Event | null>(null);
  
  // Estados para EventSettings
  const [settings, setSettings] = useState<EventSettings | null>(null);
  
  // Estados para Datas do Evento
  const [eventDates, setEventDates] = useState<EventDate[]>([]);
  
  // Estados para Perguntas
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Quando os eventos estiverem carregados e houver um evento atual
    if (eventsLoaded && currentEvent) {
      loadEventData(currentEvent.id);
    } else if (eventsLoaded) {
      setLoading(false);
    }
  }, [eventsLoaded, currentEvent]);

  const loadEventData = async (eventId: string) => {
    setLoading(true);
    try {
      const [eventData, settingsData, datesData, questionsData] = await Promise.all([
        api.getEvent(eventId),
        api.getEventSettings(eventId),
        api.getEventDates(eventId).catch(() => []), // Se não houver datas, retorna array vazio
        api.getRegistrationQuestions(eventId).catch(() => []) // Se não houver perguntas, retorna array vazio
      ]);
      setEvent(eventData);
      // Garantir que todos os campos de exibição tenham valores padrão
      setSettings({
        ...settingsData,
        show_contact: settingsData?.show_contact ?? true,
        show_social: settingsData?.show_social ?? true,
        show_contact_phone: settingsData?.show_contact_phone ?? true,
        show_contact_email: settingsData?.show_contact_email ?? true,
        show_social_instagram: settingsData?.show_social_instagram ?? true,
        show_social_facebook: settingsData?.show_social_facebook ?? true,
        show_social_website: settingsData?.show_social_website ?? true,
        confirmed_participants: settingsData?.confirmed_participants || [],
        show_included_items: settingsData?.show_included_items ?? true,
        show_confirmed_participants: settingsData?.show_confirmed_participants ?? true,
        show_available_spots: settingsData?.show_available_spots ?? true,
      });
      
      // Usar apenas datesData (da rota específica) para evitar duplicação
      // Se datesData estiver vazio mas eventData.dates tiver dados, usar eventData.dates
      const datesToUse = datesData && datesData.length > 0 ? datesData : (eventData.dates || []);
      
      // Normalizar datas: converter ISO strings para formato date (YYYY-MM-DD)
      const normalizedDates = datesToUse.map((ed: any) => {
        let dateValue: string;
        
        if (typeof ed === 'string') {
          // Se for uma string ISO, converter para date
          dateValue = isoToDate(ed);
          return {
            id: `temp-${Date.now()}-${Math.random()}`,
            event_id: eventId,
            date: dateValue
          };
        }
        
        // Se já for um objeto
        if (ed.date && typeof ed.date === 'string') {
          // Se for ISO string (tem Z ou timezone ou T), converter para date
          if (ed.date.includes('Z') || ed.date.includes('+') || ed.date.includes('T')) {
            dateValue = isoToDate(ed.date);
            return {
              ...ed,
              date: dateValue
            };
          } else if (ed.date.length === 10) {
            // Já está em formato date (YYYY-MM-DD)
            return ed;
          } else {
            // Tentar converter
            dateValue = isoToDate(ed.date);
            return {
              ...ed,
              date: dateValue
            };
          }
        }
        
        return ed;
      });
      
      setEventDates(normalizedDates);
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!event || !settings || !currentEvent) return;
    
    setSaving(true);
    try {
      // Preparar datas para envio (converter date para ISO string)
      const datesToSave = eventDates.map(ed => {
        const dateValue = ed.date;
        
        // Se já for uma string ISO completa com timezone, usar diretamente
        if (typeof dateValue === 'string' && (dateValue.includes('Z') || dateValue.includes('+'))) {
          return dateValue;
        }
        
        // Se for date format (YYYY-MM-DD) - converter para ISO
        if (typeof dateValue === 'string' && dateValue.length === 10 && !dateValue.includes('T')) {
          return dateToIso(dateValue);
        }
        
        // Caso contrário, tentar converter
        return dateToIso(String(dateValue));
      });
      
      // Remover dates do objeto event para evitar duplicação
      const { dates: _, ...eventWithoutDates } = event;
      
      // Salvar evento, configurações e datas
      await Promise.all([
        api.updateEvent(currentEvent.id, eventWithoutDates),
        updateSettings(currentEvent.id, settings), // Usa o contexto para atualizar
        api.updateEventDates(currentEvent.id, datesToSave)
      ]);

      // Salvar perguntas
      if (activeTab === 'questions' || questions.length > 0) {
        // Buscar perguntas existentes no backend
        const existingQuestions = await api.getRegistrationQuestions(currentEvent.id);
        const currentQuestionIds = new Set(questions.filter(q => !q.id.startsWith('temp-')).map(q => q.id));

        // Deletar perguntas que foram removidas
        const questionsToDelete = existingQuestions.filter(q => !currentQuestionIds.has(q.id));
        await Promise.all(questionsToDelete.map(q => api.deleteRegistrationQuestion(q.id)));

        // Criar ou atualizar perguntas
        const savedQuestionIds: string[] = [];
        
        for (let index = 0; index < questions.length; index++) {
          const question = questions[index];
          const questionData = {
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.options.filter(opt => opt.trim() !== ''),
            is_required: question.is_required,
            display_order: index
          };

          if (question.id.startsWith('temp-')) {
            // Nova pergunta - criar
            const newQuestion = await api.createRegistrationQuestion({
              event_id: currentEvent.id,
              ...questionData
            });
            savedQuestionIds.push(newQuestion.id);
          } else {
            // Pergunta existente - atualizar
            await api.updateRegistrationQuestion(question.id, questionData);
            savedQuestionIds.push(question.id);
          }
        }

        // Reordenar perguntas na ordem correta
        if (savedQuestionIds.length > 0) {
          await api.reorderRegistrationQuestions(currentEvent.id, savedQuestionIds);
        }
      }

      toast.success('Configurações salvas com sucesso!');
      loadEvent(currentEvent.id); // Atualiza o contexto do evento
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleAddIncludedItem = () => {
    if (!settings) return;
    
    const newItem: IncludedItem = {
      icon: '✨',
      title: 'Novo Item',
      description: 'Descrição do item'
    };
    
    setSettings({
      ...settings,
      included_items: [...settings.included_items, newItem]
    });
  };

  const handleRemoveIncludedItem = (index: number) => {
    if (!settings) return;
    
    const newItems = settings.included_items.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      included_items: newItems
    });
  };

  const handleUpdateIncludedItem = (index: number, field: keyof IncludedItem, value: string) => {
    if (!settings) return;
    
    const newItems = [...settings.included_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSettings({
      ...settings,
      included_items: newItems
    });
  };

  const handleAddConfirmedParticipant = () => {
    if (!settings) return;
    
    const newParticipant: ConfirmedParticipant = {
      name: '',
      description: '',
      image_url: '',
      instagram: ''
    };
    setSettings({
      ...settings,
      confirmed_participants: [...(settings.confirmed_participants || []), newParticipant]
    });
  };

  const handleRemoveConfirmedParticipant = (index: number) => {
    if (!settings) return;
    
    const newParticipants = (settings.confirmed_participants || []).filter((_, i) => i !== index);
    setSettings({
      ...settings,
      confirmed_participants: newParticipants
    });
  };

  const handleUpdateConfirmedParticipant = (index: number, field: keyof ConfirmedParticipant, value: string) => {
    if (!settings) return;
    
    const newParticipants = [...(settings.confirmed_participants || [])];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setSettings({
      ...settings,
      confirmed_participants: newParticipants
    });
  };

  // Função auxiliar para converter ISO string para date (apenas data)
  const isoToDate = (isoString: string): string => {
    const date = new Date(isoString);
    // Obter componentes da data UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função auxiliar para converter date para ISO string (meio-dia UTC para evitar problemas de timezone)
  const dateToIso = (dateString: string): string => {
    // date vem como "YYYY-MM-DD" (sem timezone)
    // Usar meio-dia UTC para evitar problemas de timezone ao converter
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Criar Date object como UTC no meio-dia (12:00)
    const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    // Retornar ISO string
    return utcDate.toISOString();
  };

  const handleAddEventDate = () => {
    const now = new Date();
    const dateString = isoToDate(now.toISOString());
    const newDate: EventDate = {
      id: `temp-${Date.now()}`,
      event_id: currentEvent?.id || '',
      date: dateString // Armazenar como date (YYYY-MM-DD) para facilitar edição
    };
    setEventDates([...eventDates, newDate]);
  };

  const handleRemoveEventDate = (index: number) => {
    const newDates = eventDates.filter((_, i) => i !== index);
    setEventDates(newDates);
  };

  const handleUpdateEventDate = (index: number, date: string) => {
    const newDates = [...eventDates];
    // O input date retorna "YYYY-MM-DD", vamos manter assim
    newDates[index] = { ...newDates[index], date };
    setEventDates(newDates);
  };

  if (loading) {
    return <Loading />;
  }

  if (!event || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Erro ao carregar configurações</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-[#B8860B] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para Inscrições</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-8 h-8 text-[#B8860B]" />
            <div>
              <h1 className="text-4xl text-gray-800">Configurações do Evento</h1>
              <p className="text-gray-600">Configure as informações que aparecem na página inicial</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E8DCC4] shadow-lg p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('event')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 md:px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'event'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                  : 'text-gray-700 hover:bg-[#F5F5DC]'
              }`}
              title="Informações do Evento"
            >
              <Calendar className="w-5 h-5 md:w-5 md:h-5" />
              <span className="hidden md:inline">Evento</span>
            </button>
            <button
              onClick={() => setActiveTab('church')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 md:px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'church'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                  : 'text-gray-700 hover:bg-[#F5F5DC]'
              }`}
              title="Informações da Igreja"
            >
              <Church className="w-5 h-5 md:w-5 md:h-5" />
              <span className="hidden md:inline">Igreja</span>
            </button>
            <button
              onClick={() => setActiveTab('included')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 md:px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'included'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                  : 'text-gray-700 hover:bg-[#F5F5DC]'
              }`}
              title="O que está incluído"
            >
              <CheckSquare className="w-5 h-5 md:w-5 md:h-5" />
              <span className="hidden md:inline">O que está incluído</span>
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 md:px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'participants'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                  : 'text-gray-700 hover:bg-[#F5F5DC]'
              }`}
              title="Participantes Confirmados"
            >
              <Users className="w-5 h-5 md:w-5 md:h-5" />
              <span className="hidden md:inline">Participantes</span>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 md:px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'questions'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                  : 'text-gray-700 hover:bg-[#F5F5DC]'
              }`}
              title="Perguntas de Inscrição"
            >
              <HelpCircle className="w-5 h-5 md:w-5 md:h-5" />
              <span className="hidden md:inline">Perguntas</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E8DCC4] shadow-lg p-8">
          {/* Tab: Informações do Evento */}
          {activeTab === 'event' && (
            <div className="space-y-6">
              <h2 className="text-2xl text-gray-800 mb-6">Informações do Evento</h2>
              
              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Nome do Evento
                </label>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Ex: Retiro Espiritual 2026"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <SettingsIcon className="w-4 h-4" />
                  Subtítulo/Badge (opcional)
                </label>
                <input
                  type="text"
                  value={settings.event_subtitle || ''}
                  onChange={(e) => setSettings({ ...settings, event_subtitle: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Ex: Evento Especial 2026"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Descrição do Evento
                </label>
                <textarea
                  value={event.description}
                  onChange={(e) => setEvent({ ...event, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Descreva o evento..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <SettingsIcon className="w-4 h-4" />
                  URL da Imagem do Título (opcional)
                </label>
                <input
                  type="url"
                  value={settings.event_title_image_url || ''}
                  onChange={(e) => setSettings({ ...settings, event_title_image_url: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">A imagem aparecerá à esquerda das informações do título do evento</p>
              </div>

              <div className="border-t border-[#E8DCC4] pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personalização Visual da Seção do Título</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      <SettingsIcon className="w-4 h-4" />
                      Imagem de Background (opcional)
                    </label>
                    <input
                      type="url"
                      value={settings.event_title_background_image_url || ''}
                      onChange={(e) => setSettings({ ...settings, event_title_background_image_url: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                      placeholder="https://exemplo.com/background.jpg"
                    />
                    <p className="text-sm text-gray-500 mt-1">Imagem de fundo para a seção do título do evento</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-gray-700 mb-2">
                        Cor do Texto
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.event_title_text_color || '#1f2937'}
                          onChange={(e) => setSettings({ ...settings, event_title_text_color: e.target.value })}
                          className="w-16 h-12 border border-[#E8DCC4] rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.event_title_text_color || '#1f2937'}
                          onChange={(e) => setSettings({ ...settings, event_title_text_color: e.target.value })}
                          className="flex-1 px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          placeholder="#1f2937"
                          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-gray-700 mb-2">
                        Cor do Botão
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.event_title_button_color || '#D4AF37'}
                          onChange={(e) => setSettings({ ...settings, event_title_button_color: e.target.value })}
                          className="w-16 h-12 border border-[#E8DCC4] rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.event_title_button_color || '#D4AF37'}
                          onChange={(e) => setSettings({ ...settings, event_title_button_color: e.target.value })}
                          className="flex-1 px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          placeholder="#D4AF37"
                          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-gray-700 mb-2">
                        Cor do Texto do Botão
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.event_title_button_text_color || '#ffffff'}
                          onChange={(e) => setSettings({ ...settings, event_title_button_text_color: e.target.value })}
                          className="w-16 h-12 border border-[#E8DCC4] rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.event_title_button_text_color || '#ffffff'}
                          onChange={(e) => setSettings({ ...settings, event_title_button_text_color: e.target.value })}
                          className="flex-1 px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          placeholder="#ffffff"
                          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      Peso da Fonte (Font Weight)
                    </label>
                    <select
                      value={settings.event_title_font_weight || '700'}
                      onChange={(e) => setSettings({ ...settings, event_title_font_weight: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="100">100 - Thin</option>
                      <option value="200">200 - Extra Light</option>
                      <option value="300">300 - Light</option>
                      <option value="400">400 - Normal</option>
                      <option value="500">500 - Medium</option>
                      <option value="600">600 - Semi Bold</option>
                      <option value="700">700 - Bold</option>
                      <option value="800">800 - Extra Bold</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Escolha o peso da fonte para os textos do título</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Datas do Evento
                  </label>
                  <button
                    onClick={handleAddEventDate}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Data
                  </button>
                </div>
                <div className="space-y-3">
                  {eventDates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-[#F5F5DC]/30 rounded-lg border border-[#E8DCC4]">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma data adicionada</p>
                      <p className="text-xs">Clique em "Adicionar Data" para começar</p>
                    </div>
                  ) : (
                     eventDates.map((eventDate, index) => (
                       <div key={eventDate.id || index} className="flex gap-3 items-center bg-[#F5F5DC]/30 rounded-lg p-3 border border-[#E8DCC4]">
                         <input
                           type="date"
                           value={typeof eventDate.date === 'string' 
                             ? (eventDate.date.length === 10 ? eventDate.date : isoToDate(eventDate.date))
                             : isoToDate(new Date(eventDate.date).toISOString())}
                           onChange={(e) => handleUpdateEventDate(index, e.target.value)}
                           className="flex-1 px-4 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                         />
                         <button
                           onClick={() => handleRemoveEventDate(index)}
                           className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                           title="Remover data"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     ))
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  Horário de Início (texto)
                </label>
                <input
                  type="text"
                  value={settings.event_time || ''}
                  onChange={(e) => setSettings({ ...settings, event_time: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Ex: 09h00 - Início das atividades"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Localização
                </label>
                <input
                  type="text"
                  value={event.location}
                  onChange={(e) => setEvent({ ...event, location: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Ex: Centro de Retiros - Serra da Mantiqueira, MG"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Investimento (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={event.price}
                    onChange={(e) => setEvent({ ...event, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    placeholder="350.00"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Número de Vagas
                  </label>
                  <input
                    type="number"
                    value={event.max_participants || ''}
                    onChange={(e) => setEvent({ ...event, max_participants: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Opção para exibir vagas disponíveis */}
              <div className="mt-6 pt-6 border-t border-[#E8DCC4]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_available_spots !== false}
                    onChange={(e) => setSettings({ ...settings, show_available_spots: e.target.checked })}
                    className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">Exibir vagas disponíveis na página inicial</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab: Informações da Igreja */}
          {activeTab === 'church' && (
            <div className="space-y-6">
              <h2 className="text-2xl text-gray-800 mb-6">Informações da Igreja e Contato</h2>
              
              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Church className="w-4 h-4" />
                  Nome da Igreja
                </label>
                <input
                  type="text"
                  value={settings.church_name}
                  onChange={(e) => setSettings({ ...settings, church_name: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Ex: Igreja Evangélica Nova Vida"
                />
              </div>

              {/* Gerenciamento de Telefones WhatsApp */}
              <div className="border border-[#E8DCC4] rounded-lg p-6 bg-[#F5F5DC]/30">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-gray-700 font-semibold">
                    <Phone className="w-5 h-5" />
                    Telefones WhatsApp
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newPhone: ContactPhone = {
                        id: Date.now().toString(),
                        phone: '',
                        description: '',
                        use_for_pix_support: false,
                      };
                      setSettings({
                        ...settings,
                        contact_phones: [...(settings.contact_phones || []), newPhone],
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar WhatsApp
                  </button>
                </div>

                <div className="space-y-4">
                  {(settings.contact_phones || []).map((contactPhone, index) => (
                    <div key={contactPhone.id} className="bg-white rounded-lg p-4 border border-[#E8DCC4]">
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Número do WhatsApp
                          </label>
                          <input
                            type="text"
                            value={contactPhone.phone}
                            onChange={(e) => {
                              const updated = [...(settings.contact_phones || [])];
                              updated[index] = { ...updated[index], phone: e.target.value };
                              setSettings({ ...settings, contact_phones: updated });
                            }}
                            className="w-full px-3 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            placeholder="(11) 98765-4321"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Descrição (ex: Suporte, Vendas, Financeiro)
                          </label>
                          <input
                            type="text"
                            value={contactPhone.description}
                            onChange={(e) => {
                              const updated = [...(settings.contact_phones || [])];
                              updated[index] = { ...updated[index], description: e.target.value };
                              setSettings({ ...settings, contact_phones: updated });
                            }}
                            className="w-full px-3 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            placeholder="Ex: Suporte de Pagamento"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contactPhone.use_for_pix_support}
                            onChange={(e) => {
                              const updated = [...(settings.contact_phones || [])];
                              // Se marcando este, desmarcar os outros
                              if (e.target.checked) {
                                updated.forEach((cp, i) => {
                                  updated[i] = { ...cp, use_for_pix_support: i === index };
                                });
                              } else {
                                updated[index] = { ...updated[index], use_for_pix_support: false };
                              }
                              setSettings({ ...settings, contact_phones: updated });
                            }}
                            className="w-4 h-4 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">
                            Usar para suporte de pagamento PIX
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (settings.contact_phones || []).filter((_, i) => i !== index);
                            setSettings({ ...settings, contact_phones: updated });
                          }}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!settings.contact_phones || settings.contact_phones.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum WhatsApp configurado. Clique em "Adicionar WhatsApp" para começar.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  value={settings.church_contact_email || ''}
                  onChange={(e) => setSettings({ ...settings, church_contact_email: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="contato@igreja.com.br"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={settings.church_instagram || ''}
                    onChange={(e) => setSettings({ ...settings, church_instagram: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    placeholder="@igrejavida"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={settings.church_facebook || ''}
                    onChange={(e) => setSettings({ ...settings, church_facebook: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    placeholder="igrejavida"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={settings.church_website || ''}
                    onChange={(e) => setSettings({ ...settings, church_website: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    placeholder="https://www.igreja.com.br"
                  />
                </div>
              </div>

              {/* Opções de Exibição */}
              <div className="mt-8 pt-6 border-t border-[#E8DCC4]">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Opções de Exibição no Rodapé</h3>
                
                {/* Controle Geral de Seções */}
                <div className="mb-6 pb-6 border-b border-[#E8DCC4]">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    Controle Geral
                  </h4>
                  <div className="space-y-3 pl-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_contact !== false}
                        onChange={(e) => setSettings({ ...settings, show_contact: e.target.checked })}
                        className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2"
                      />
                      <span className="text-gray-700">Exibir seção de contato no rodapé</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_social !== false}
                        onChange={(e) => setSettings({ ...settings, show_social: e.target.checked })}
                        className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2"
                      />
                      <span className="text-gray-700">Exibir seção de redes sociais no rodapé</span>
                    </label>
                  </div>
                </div>

                {/* Controle Individual - Contato */}
                <div className="mb-6 pb-6 border-b border-[#E8DCC4]">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Itens de Contato
                  </h4>
                  <div className="space-y-3 pl-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_contact_phone !== false}
                        onChange={(e) => setSettings({ ...settings, show_contact_phone: e.target.checked })}
                        disabled={settings.show_contact === false}
                        className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-gray-700 ${settings.show_contact === false ? 'opacity-50' : ''}`}>
                        Exibir telefone de contato
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_contact_email !== false}
                        onChange={(e) => setSettings({ ...settings, show_contact_email: e.target.checked })}
                        disabled={settings.show_contact === false}
                        className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-gray-700 ${settings.show_contact === false ? 'opacity-50' : ''}`}>
                        Exibir email de contato
                      </span>
                    </label>
                  </div>
                </div>

                {/* Controle Individual - Redes Sociais */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Redes Sociais
                  </h4>
                  <div className="space-y-3 pl-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_social_instagram !== false}
                        onChange={(e) => setSettings({ ...settings, show_social_instagram: e.target.checked })}
                        disabled={settings.show_social === false}
                        className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-gray-700 ${settings.show_social === false ? 'opacity-50' : ''}`}>
                        Exibir link do Instagram
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_social_facebook !== false}
                        onChange={(e) => setSettings({ ...settings, show_social_facebook: e.target.checked })}
                        disabled={settings.show_social === false}
                        className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-gray-700 ${settings.show_social === false ? 'opacity-50' : ''}`}>
                        Exibir link do Facebook
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_social_website !== false}
                        onChange={(e) => setSettings({ ...settings, show_social_website: e.target.checked })}
                        disabled={settings.show_social === false}
                        className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-gray-700 ${settings.show_social === false ? 'opacity-50' : ''}`}>
                        Exibir link do Website
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: O que está incluído */}
          {activeTab === 'included' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-gray-800 pl-4 md:pl-0">O que está incluído no evento</h2>
                <button
                  onClick={handleAddIncludedItem}
                  className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
                  title="Adicionar Item"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden md:inline">Adicionar Item</span>
                </button>
              </div>

              {/* Flag para exibir seção */}
              <div className="mb-6 pb-4 border-b border-[#E8DCC4]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_included_items !== false}
                    onChange={(e) => setSettings({ ...settings, show_included_items: e.target.checked })}
                    className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">Exibir seção "O que está incluído" na página inicial</span>
                </label>
              </div>

              <div className="space-y-4">
                {settings.included_items.map((item, index) => (
                  <div key={index} className="bg-[#F5F5DC]/30 rounded-lg p-4 border border-[#E8DCC4]">
                    <div className="grid md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-1">
                        <label className="text-gray-700 text-sm mb-2 block">Ícone</label>
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) => handleUpdateIncludedItem(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37] text-center text-2xl"
                          placeholder="🎵"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="text-gray-700 text-sm mb-2 block">Título</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateIncludedItem(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          placeholder="Ex: Momentos de Louvor"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <label className="text-gray-700 text-sm mb-2 block">Descrição</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateIncludedItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          placeholder="Ex: Adoração e música"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <button
                          onClick={() => handleRemoveIncludedItem(index)}
                          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {settings.included_items.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum item adicionado ainda</p>
                    <p className="text-sm">Clique em "Adicionar Item" para começar</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Participantes Confirmados */}
          {activeTab === 'participants' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-gray-800 pl-4 md:pl-0">Participantes Confirmados</h2>
                <button
                  onClick={handleAddConfirmedParticipant}
                  className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
                  title="Adicionar Participante"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden md:inline">Adicionar Participante</span>
                </button>
              </div>

              {/* Flag para exibir seção */}
              <div className="mb-6 pb-4 border-b border-[#E8DCC4]">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_confirmed_participants !== false}
                        onChange={(e) => setSettings({ ...settings, show_confirmed_participants: e.target.checked })}
                        className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2"
                      />
                      <span className="text-gray-700 font-medium">Exibir seção "Participantes Confirmados" na página inicial</span>
                    </label>
              </div>

              <div className="space-y-6">
                {(settings.confirmed_participants || []).map((participant, index) => (
                  <div key={index} className="bg-[#F5F5DC]/30 rounded-lg p-6 border border-[#E8DCC4]">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-12">
                          <label className="text-gray-700 text-sm mb-2 block font-semibold">Nome do Participante</label>
                          <input
                            type="text"
                            value={participant.name}
                            onChange={(e) => handleUpdateConfirmedParticipant(index, 'name', e.target.value)}
                            className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            placeholder="Ex: João Silva"
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-6">
                          <label className="text-gray-700 text-sm mb-2 block font-semibold">URL da Imagem (opcional)</label>
                          <input
                            type="url"
                            value={participant.image_url || ''}
                            onChange={(e) => handleUpdateConfirmedParticipant(index, 'image_url', e.target.value)}
                            className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            placeholder="https://exemplo.com/imagem.jpg"
                          />
                        </div>
                        <div className="md:col-span-5">
                          <label className="text-gray-700 text-sm mb-2 block font-semibold">Descrição</label>
                          <textarea
                            value={participant.description}
                            onChange={(e) => handleUpdateConfirmedParticipant(index, 'description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            placeholder="Descrição do participante..."
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                          <button
                            onClick={() => handleRemoveConfirmedParticipant(index)}
                            className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-6">
                          <label className="text-gray-700 text-sm mb-2 block font-semibold">Instagram (opcional)</label>
                          <input
                            type="text"
                            value={participant.instagram || ''}
                            onChange={(e) => handleUpdateConfirmedParticipant(index, 'instagram', e.target.value)}
                            className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                            placeholder="@usuario ou https://instagram.com/usuario"
                          />
                          <p className="text-xs text-gray-500 mt-1">Ao clicar no card do participante na home, abrirá o Instagram</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!settings.confirmed_participants || settings.confirmed_participants.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum participante confirmado adicionado ainda</p>
                    <p className="text-sm">Clique em "Adicionar Participante" para começar</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Perguntas de Inscrição */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-gray-800 pl-4 md:pl-0">Perguntas de Inscrição</h2>
                <button
                  onClick={() => {
                    if (!currentEvent) return;
                    const newQuestion: RegistrationQuestion = {
                      id: `temp-${Date.now()}`,
                      event_id: currentEvent.id,
                      question_text: '',
                      question_type: 'text',
                      options: [],
                      is_required: false,
                      display_order: questions.length
                    };
                    setQuestions([...questions, newQuestion]);
                  }}
                  className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
                  title="Adicionar Pergunta"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden md:inline">Adicionar Pergunta</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-[#F5F5DC]/30 rounded-lg p-2 md:p-4 border border-[#E8DCC4]">
                    <div className="space-y-4">
                      {/* Botões de controle no topo */}
                      <div className="flex items-center justify-end gap-2 pb-2 border-b border-[#E8DCC4]">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              if (index > 0) {
                                const newQuestions = [...questions];
                                [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
                                setQuestions(newQuestions);
                              }
                            }}
                            disabled={index === 0}
                            className="p-1.5 rounded hover:bg-[#F5F5DC] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Mover para cima"
                          >
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              if (index < questions.length - 1) {
                                const newQuestions = [...questions];
                                [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
                                setQuestions(newQuestions);
                              }
                            }}
                            disabled={index === questions.length - 1}
                            className="p-1.5 rounded hover:bg-[#F5F5DC] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Mover para baixo"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={async () => {
                            if (!currentEvent) return;
                            if (question.id.startsWith('temp-')) {
                              // Se for temporária, apenas remover do estado
                              setQuestions(questions.filter((_, i) => i !== index));
                            } else {
                              // Se for existente, deletar do backend
                              try {
                                await api.deleteRegistrationQuestion(question.id);
                                toast.success('Pergunta removida com sucesso!');
                                const updatedQuestions = await api.getRegistrationQuestions(currentEvent.id);
                                setQuestions(updatedQuestions);
                              } catch (error: any) {
                                console.error('Erro ao remover pergunta:', error);
                                toast.error(error.response?.data?.error || 'Erro ao remover pergunta');
                              }
                            }
                          }}
                          className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="Remover pergunta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                          <div>
                            <label className="text-gray-700 text-sm mb-2 block font-semibold">Texto da Pergunta *</label>
                            <input
                              type="text"
                              value={question.question_text}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[index] = { ...question, question_text: e.target.value };
                                setQuestions(newQuestions);
                              }}
                              className="w-full px-2 md:px-4 py-2 md:py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                              placeholder="Ex: Qual sua experiência com eventos espirituais?"
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-gray-700 text-sm mb-2 block font-semibold">Tipo de Resposta *</label>
                              <select
                                value={question.question_type}
                                onChange={(e) => {
                                  const newQuestions = [...questions];
                                  const newType = e.target.value as 'text' | 'single_choice' | 'multiple_choice';
                                  newQuestions[index] = {
                                    ...question,
                                    question_type: newType,
                                    options: (newType === 'single_choice' || newType === 'multiple_choice') && question.options.length === 0
                                      ? ['']
                                      : question.options
                                  };
                                  setQuestions(newQuestions);
                                }}
                                className="w-full px-2 md:px-4 py-2 md:py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                              >
                                <option value="text">Texto</option>
                                <option value="single_choice">Uma opção</option>
                                <option value="multiple_choice">Várias opções</option>
                              </select>
                            </div>

                            <div className="flex flex-col justify-end">
                              <label className="flex items-center gap-3 cursor-pointer h-[52px]">
                                <input
                                  type="checkbox"
                                  checked={question.is_required}
                                  onChange={(e) => {
                                    const newQuestions = [...questions];
                                    newQuestions[index] = { ...question, is_required: e.target.checked };
                                    setQuestions(newQuestions);
                                  }}
                                  className="w-5 h-5 text-[#D4AF37] border-[#E8DCC4] rounded focus:ring-[#D4AF37] focus:ring-2"
                                />
                                <span className="text-gray-700 font-medium">Pergunta obrigatória</span>
                              </label>
                            </div>
                          </div>

                          {(question.question_type === 'single_choice' || question.question_type === 'multiple_choice') && (
                            <div>
                              <label className="text-gray-700 text-sm mb-2 block font-semibold">Opções de Resposta *</label>
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2 min-w-0">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newQuestions = [...questions];
                                        const newOptions = [...question.options];
                                        newOptions[optIndex] = e.target.value;
                                        newQuestions[index] = { ...question, options: newOptions };
                                        setQuestions(newQuestions);
                                      }}
                                      className="flex-1 min-w-0 px-2 md:px-4 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                      placeholder={`Opção ${optIndex + 1}`}
                                    />
                                    <button
                                      onClick={() => {
                                        const newQuestions = [...questions];
                                        const newOptions = question.options.filter((_, i) => i !== optIndex);
                                        newQuestions[index] = { ...question, options: newOptions };
                                        setQuestions(newQuestions);
                                      }}
                                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0"
                                      title="Remover opção"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const newQuestions = [...questions];
                                    const newOptions = [...question.options, ''];
                                    newQuestions[index] = { ...question, options: newOptions };
                                    setQuestions(newQuestions);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#B8860B] hover:text-[#D4AF37] transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  Adicionar Opção
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma pergunta adicionada ainda</p>
                    <p className="text-sm">Clique em "Adicionar Pergunta" para começar</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão Salvar Fixo */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
