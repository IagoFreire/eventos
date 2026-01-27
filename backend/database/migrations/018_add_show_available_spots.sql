-- Migration 018: Add show_available_spots column to event_settings
-- Adiciona coluna para controlar exibição de vagas disponíveis

ALTER TABLE event_settings
ADD COLUMN IF NOT EXISTS show_available_spots BOOLEAN DEFAULT true;
