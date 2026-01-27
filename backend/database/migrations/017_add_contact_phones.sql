-- Migration 017: Add contact_phones column to event_settings
-- Adiciona coluna para armazenar múltiplos telefones WhatsApp com descrição

ALTER TABLE event_settings
ADD COLUMN IF NOT EXISTS contact_phones JSONB DEFAULT '[]'::jsonb;
