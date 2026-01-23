-- Migration 002: Criar tabela de controle de migrations
-- Esta tabela controla quais migrations já foram executadas

CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE migrations IS 'Controle de migrations executadas';
