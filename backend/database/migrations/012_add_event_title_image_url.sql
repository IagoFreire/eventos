-- Migration 012: Add event_title_image_url to event_settings
-- Adiciona campo para URL da imagem do título do evento

ALTER TABLE event_settings
ADD COLUMN IF NOT EXISTS event_title_image_url VARCHAR(500);
