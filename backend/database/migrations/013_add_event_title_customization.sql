-- Migration 013: Add event title customization fields to event_settings
-- Adiciona campos para personalização visual da seção do título do evento

ALTER TABLE event_settings
ADD COLUMN IF NOT EXISTS event_title_background_image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS event_title_text_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS event_title_button_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS event_title_button_text_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS event_title_font_weight VARCHAR(3);
