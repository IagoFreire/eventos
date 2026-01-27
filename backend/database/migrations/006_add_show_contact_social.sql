-- Migration 006: Adicionar campos para controlar exibição de contato e redes sociais
-- Adiciona campos booleanos para permitir desabilitar a exibição de informações de contato e redes sociais

ALTER TABLE event_settings 
ADD COLUMN IF NOT EXISTS show_contact BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_social BOOLEAN DEFAULT TRUE;

-- Comentários nas colunas
COMMENT ON COLUMN event_settings.show_contact IS 'Controla se a seção de contato deve ser exibida no footer';
COMMENT ON COLUMN event_settings.show_social IS 'Controla se a seção de redes sociais deve ser exibida no footer';
