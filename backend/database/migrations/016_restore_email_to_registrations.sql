-- Migration 016: Restore email column to registrations table
-- Restaura o campo email na tabela de inscrições

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS email VARCHAR(255);
