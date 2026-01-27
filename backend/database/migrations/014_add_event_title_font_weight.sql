-- Migration 014: Add event_title_font_weight to event_settings
-- Adiciona campo para peso da fonte do título do evento (caso a migration 013 não tenha incluído)

ALTER TABLE event_settings
ADD COLUMN IF NOT EXISTS event_title_font_weight VARCHAR(3);
