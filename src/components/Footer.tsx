import React, { useEffect, useState } from 'react';
import { Phone, Mail, Instagram, Facebook, Globe, MapPin } from 'lucide-react';
import { api } from '../services/apiSelector';
import type { EventSettings } from '../types';

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const eventId = '1';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await api.getEventSettings(eventId);
      setSettings(settingsData);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const defaultSettings: EventSettings = {
    id: 'default',
    event_id: '1',
    event_subtitle: '',
    event_time: '',
    included_items: [],
    church_name: 'Igreja Evangélica',
    church_contact_phone: '(11) 98765-4321',
    church_contact_email: 'contato@igreja.com.br',
  };

  const churchSettings = settings || defaultSettings;

  return (
    <footer className="bg-gradient-to-br from-[#F5F5DC] to-white border-t border-[#E8DCC4] py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Informações da Igreja */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✝</span>
              </div>
              <h3 className="text-xl text-[#B8860B] font-semibold">{churchSettings.church_name}</h3>
            </div>
            <p className="text-gray-600">Juntos em comunhão e fé, celebrando a presença de Deus em nossas vidas.</p>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#B8860B]" />
              Contato
            </h4>
            <div className="space-y-3">
              {churchSettings.church_contact_phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-[#B8860B]" />
                  <span>{churchSettings.church_contact_phone}</span>
                </div>
              )}
              {churchSettings.church_contact_email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-[#B8860B]" />
                  <a href={`mailto:${churchSettings.church_contact_email}`} className="hover:text-[#B8860B] transition-colors">
                    {churchSettings.church_contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              {churchSettings.church_instagram && (
                <a
                  href={`https://instagram.com/${churchSettings.church_instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
              {churchSettings.church_facebook && (
                <a
                  href={`https://facebook.com/${churchSettings.church_facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
              )}
              {churchSettings.church_website && (
                <a
                  href={churchSettings.church_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  title="Website"
                >
                  <Globe className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-4">Siga-nos e fique por dentro de todos os eventos e novidades!</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-600 pt-6 border-t border-[#E8DCC4]">
          <p>&copy; 2026 {churchSettings.church_name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
