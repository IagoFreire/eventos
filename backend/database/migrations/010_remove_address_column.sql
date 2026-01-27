-- Migration 010: Remove address column from registrations table
-- Remove a coluna de endereço da tabela de inscrições

-- Remover a coluna address da tabela registrations
ALTER TABLE registrations DROP COLUMN IF EXISTS address;

-- Comentário de confirmação
COMMENT ON TABLE registrations IS 'Tabela de inscrições nos eventos (sem endereço)';
