-- Migration 007: Adicionar campos individuais para controlar exibição de cada item
-- Permite desabilitar telefone, email, Instagram, Facebook e Website individualmente

ALTER TABLE event_settings 
ADD COLUMN IF NOT EXISTS show_contact_phone BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_contact_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_social_instagram BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_social_facebook BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_social_website BOOLEAN DEFAULT TRUE;

-- Comentários nas colunas
COMMENT ON COLUMN event_settings.show_contact_phone IS 'Controla se o telefone de contato deve ser exibido no footer';
COMMENT ON COLUMN event_settings.show_contact_email IS 'Controla se o email de contato deve ser exibido no footer';
COMMENT ON COLUMN event_settings.show_social_instagram IS 'Controla se o link do Instagram deve ser exibido no footer';
COMMENT ON COLUMN event_settings.show_social_facebook IS 'Controla se o link do Facebook deve ser exibido no footer';
COMMENT ON COLUMN event_settings.show_social_website IS 'Controla se o link do Website deve ser exibido no footer';
