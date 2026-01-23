import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useEvent } from '../contexts/EventContext';
import { useSettings } from '../contexts/SettingsContext';
import type { Event, EventSettings, IncludedItem } from '../types';
import { api } from '../services/apiSelector';
import { 
  ArrowLeft, 
  Save, 
  LogOut, 
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
  Globe
} from 'lucide-react';
import Loading from '../components/Loading';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { loadEvent, currentEvent, eventsLoaded } = useEvent();
  const { updateSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'event' | 'church' | 'included'>('event');
  
  // Estados para Event
  const [event, setEvent] = useState<Event | null>(null);
  
  // Estados para EventSettings
  const [settings, setSettings] = useState<EventSettings | null>(null);

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
      const [eventData, settingsData] = await Promise.all([
        api.getEvent(eventId),
        api.getEventSettings(eventId)
      ]);
      setEvent(eventData);
      setSettings(settingsData);
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
      await Promise.all([
        api.updateEvent(currentEvent.id, event),
        updateSettings(currentEvent.id, settings) // Usa o contexto para atualizar
      ]);
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
            
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-[#E8DCC4] rounded-lg text-gray-700 hover:bg-white/80 hover:border-[#D4AF37] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
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
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'event'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                  : 'text-gray-700 hover:bg-[#F5F5DC]'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Informações do Evento</span>
            </button>
            <button
              onClick={() => setActiveTab('church')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'church'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                  : 'text-gray-700 hover:bg-[#F5F5DC]'
              }`}
            >
              <Church className="w-5 h-5" />
              <span>Informações da Igreja</span>
            </button>
            <button
              onClick={() => setActiveTab('included')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'included'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                  : 'text-gray-700 hover:bg-[#F5F5DC]'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>O que está incluído</span>
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Data e Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={event.date.slice(0, 16)}
                    onChange={(e) => setEvent({ ...event, date: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  />
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={settings.church_contact_phone || ''}
                    onChange={(e) => setSettings({ ...settings, church_contact_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    placeholder="(11) 98765-4321"
                  />
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
            </div>
          )}

          {/* Tab: O que está incluído */}
          {activeTab === 'included' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-gray-800">O que está incluído no evento</h2>
                <button
                  onClick={handleAddIncludedItem}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Item</span>
                </button>
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
