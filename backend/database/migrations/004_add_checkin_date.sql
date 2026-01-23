-- Migration 004: Adicionar data de check-in
-- Adiciona campo para rastrear quando o check-in foi realizado

-- Adicionar coluna checked_in_date (data do check-in)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS checked_in_date TIMESTAMP;

-- Comentário da coluna
COMMENT ON COLUMN registrations.checked_in_date IS 'Data e hora em que o check-in foi realizado';
