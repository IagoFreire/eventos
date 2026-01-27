-- Migration 009: Adicionar flags para controlar exibição de seções
-- Permite desabilitar as seções "O que está incluído" e "Participantes Confirmados"

ALTER TABLE event_settings 
ADD COLUMN IF NOT EXISTS show_included_items BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_confirmed_participants BOOLEAN DEFAULT TRUE;

-- Comentários nas colunas
COMMENT ON COLUMN event_settings.show_included_items IS 'Controla se a seção "O que está incluído" deve ser exibida na home';
COMMENT ON COLUMN event_settings.show_confirmed_participants IS 'Controla se a seção "Participantes Confirmados" deve ser exibida na home';
