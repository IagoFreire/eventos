import React from 'react';
import { Phone, Mail, Instagram, Facebook, Globe, MessageCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import type { EventSettings } from '../types';
import logoImage from '../assets/logo.png';

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

const Footer: React.FC = () => {
  const { settings, loading } = useSettings();

  // Não renderizar nada enquanto estiver carregando
  if (loading) {
    return null;
  }

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
  
  // Obter telefones WhatsApp configurados ou usar o telefone antigo para compatibilidade
  const contactPhones = churchSettings.contact_phones && churchSettings.contact_phones.length > 0
    ? churchSettings.contact_phones
    : (churchSettings.church_contact_phone ? [{
        id: 'legacy',
        phone: churchSettings.church_contact_phone,
        description: 'Contato',
        use_for_pix_support: false
      }] : []);
  
  // Verificar quais itens devem ser exibidos
  const showContactSection = churchSettings.show_contact !== false;
  const showContactPhone = showContactSection && (churchSettings.show_contact_phone !== false) && contactPhones.length > 0;
  const showContactEmail = showContactSection && (churchSettings.show_contact_email !== false) && churchSettings.church_contact_email;
  const hasContactItems = showContactPhone || showContactEmail;
  
  const showSocialSection = churchSettings.show_social !== false;
  const showInstagram = showSocialSection && (churchSettings.show_social_instagram !== false) && churchSettings.church_instagram;
  const showFacebook = showSocialSection && (churchSettings.show_social_facebook !== false) && churchSettings.church_facebook;
  const showWebsite = showSocialSection && (churchSettings.show_social_website !== false) && churchSettings.church_website;
  const hasSocialItems = showInstagram || showFacebook || showWebsite;
  
  // Calcular quantas colunas são necessárias baseado nas seções visíveis
  const visibleSections = 1 + (hasContactItems ? 1 : 0) + (hasSocialItems ? 1 : 0);
  const gridCols = visibleSections === 1 ? 'md:grid-cols-1' : visibleSections === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <footer className="bg-gradient-to-br from-[#F5F5DC] to-white border-t border-[#E8DCC4] py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className={`grid ${gridCols} gap-8 mb-8`}>
          {/* Informações da Igreja */}
          <div>
            <div className="flex items-center gap-2 mb-4">
            <img src={logoImage} alt="Logo da Igreja" style={{ height: 40}} />
            </div>
            <p className="text-gray-600">Juntos em comunhão e fé</p>
          </div>

          {/* Contato */}
          {hasContactItems && (
            <div>
              <h4 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#B8860B]" />
                Contato
              </h4>
              <div className="space-y-3">
                {showContactPhone && contactPhones.map((contactPhone) => {
                  const formattedPhone = formatPhoneForWhatsApp(contactPhone.phone);
                  const whatsappUrl = `https://wa.me/${formattedPhone}`;
                  
                  return (
                    <div key={contactPhone.id} className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="w-4 h-4 text-[#B8860B]" />
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#B8860B] transition-colors flex items-center gap-2"
                      >
                        <span>{contactPhone.phone}</span>
                        {contactPhone.description && (
                          <span className="text-xs text-gray-500">({contactPhone.description})</span>
                        )}
                      </a>
                    </div>
                  );
                })}
                {showContactEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-[#B8860B]" />
                    <a href={`mailto:${churchSettings.church_contact_email}`} className="hover:text-[#B8860B] transition-colors">
                      {churchSettings.church_contact_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Redes Sociais */}
          {hasSocialItems && (
            <div>
              <h4 className="text-gray-800 font-semibold mb-4">Redes Sociais</h4>
              <div className="flex gap-3">
                {showInstagram && (
                  <a
                    href={`https://instagram.com/${churchSettings.church_instagram?.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                    title="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                )}
                {showFacebook && (
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
                {showWebsite && (
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
          )}
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
