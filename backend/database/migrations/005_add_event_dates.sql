-- Migration 005: Adicionar suporte a múltiplas datas de evento
-- Permite que um evento tenha várias datas/horários

-- Criar tabela de datas do evento
CREATE TABLE IF NOT EXISTS event_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, date)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_event_dates_event_id ON event_dates(event_id);
CREATE INDEX IF NOT EXISTS idx_event_dates_date ON event_dates(date);

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_event_dates_updated_at ON event_dates;
CREATE TRIGGER update_event_dates_updated_at BEFORE UPDATE ON event_dates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentário na tabela
COMMENT ON TABLE event_dates IS 'Tabela de datas/horários dos eventos (suporte a múltiplas datas)';

-- Migrar dados existentes: criar uma entrada em event_dates para cada evento existente
INSERT INTO event_dates (event_id, date)
SELECT id, date FROM events
WHERE NOT EXISTS (
  SELECT 1 FROM event_dates WHERE event_dates.event_id = events.id
);
