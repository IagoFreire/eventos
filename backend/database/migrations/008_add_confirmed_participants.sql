-- Migration 008: Adicionar campo confirmed_participants para participantes confirmados
-- Permite configurar participantes confirmados que serão exibidos na home

ALTER TABLE event_settings 
ADD COLUMN IF NOT EXISTS confirmed_participants JSONB DEFAULT '[]';

-- Comentário na coluna
COMMENT ON COLUMN event_settings.confirmed_participants IS 'Array de participantes confirmados com nome, descrição e imagem';
