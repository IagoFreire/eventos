-- Migração: Adicionar tabela de configurações do evento
-- Data: 2026-01-22
-- Descrição: Adiciona suporte para configurações customizáveis do evento e informações da igreja

-- Habilitar a extensão UUID (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Configurações do Evento
CREATE TABLE IF NOT EXISTS event_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  -- Informações do Evento
  event_subtitle TEXT,
  event_time VARCHAR(100),
  -- O que está incluído (armazenado como JSON)
  included_items JSONB DEFAULT '[]'::jsonb,
  -- Informações da Igreja
  church_name VARCHAR(255) NOT NULL,
  church_contact_phone VARCHAR(20),
  church_contact_email VARCHAR(255),
  church_instagram VARCHAR(255),
  church_facebook VARCHAR(255),
  church_website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id)
);

-- Índice para busca por event_id
CREATE INDEX IF NOT EXISTS idx_event_settings_event_id ON event_settings(event_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_event_settings_updated_at BEFORE UPDATE ON event_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentário na tabela
COMMENT ON TABLE event_settings IS 'Configurações adicionais dos eventos (igreja, itens incluídos, etc)';

-- Dados iniciais de exemplo para o evento existente
-- Substitua o UUID abaixo pelo ID do seu evento
DO $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Busca o primeiro evento ou cria um se não existir
  SELECT id INTO v_event_id FROM events LIMIT 1;
  
  IF v_event_id IS NOT NULL THEN
    INSERT INTO event_settings (
      event_id,
      event_subtitle,
      event_time,
      included_items,
      church_name,
      church_contact_phone,
      church_contact_email,
      church_instagram,
      church_facebook
    ) VALUES (
      v_event_id,
      'Evento Especial 2026',
      '09h00 - Início das atividades',
      '[
        {"icon": "🛏️", "title": "Hospedagem Completa", "description": "Acomodações confortáveis"},
        {"icon": "🍽️", "title": "Alimentação Incluída", "description": "Todas as refeições"},
        {"icon": "🎵", "title": "Momentos de Louvor", "description": "Adoração e música"},
        {"icon": "📖", "title": "Estudos Bíblicos", "description": "Aprofundamento espiritual"},
        {"icon": "🙏", "title": "Tempo de Oração", "description": "Momentos de intercessão"},
        {"icon": "👥", "title": "Comunhão Fraterna", "description": "Conexão com irmãos"}
      ]'::jsonb,
      'Igreja Evangélica Nova Vida',
      '(11) 98765-4321',
      'contato@igrejavida.com.br',
      '@igrejavida',
      'igrejavida'
    )
    ON CONFLICT (event_id) DO NOTHING;
  END IF;
END $$;

-- Verificação da estrutura criada
SELECT 
  'event_settings' as tabela,
  COUNT(*) as total_registros
FROM event_settings;
