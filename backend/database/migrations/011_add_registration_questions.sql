-- Migration 011: Adicionar sistema de perguntas dinâmicas para inscrições
-- Permite que administradores configurem perguntas customizadas para cada evento

-- Tabela de Perguntas de Inscrição
CREATE TABLE IF NOT EXISTS registration_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('text', 'single_choice', 'multiple_choice')),
  options JSONB DEFAULT '[]'::jsonb, -- Array de opções para single_choice e multiple_choice
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0, -- Ordem de exibição
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Respostas de Inscrição
CREATE TABLE IF NOT EXISTS registration_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES registration_questions(id) ON DELETE CASCADE,
  answer_text TEXT, -- Para tipo 'text' ou quando a resposta é texto
  answer_options JSONB DEFAULT '[]'::jsonb, -- Array de opções selecionadas para multiple_choice
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(registration_id, question_id) -- Uma resposta por pergunta por inscrição
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_registration_questions_event_id ON registration_questions(event_id);
CREATE INDEX IF NOT EXISTS idx_registration_questions_display_order ON registration_questions(event_id, display_order);
CREATE INDEX IF NOT EXISTS idx_registration_answers_registration_id ON registration_answers(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_answers_question_id ON registration_answers(question_id);

-- Comentários
COMMENT ON TABLE registration_questions IS 'Perguntas customizadas configuradas pelos administradores para cada evento';
COMMENT ON TABLE registration_answers IS 'Respostas dos participantes às perguntas customizadas';
COMMENT ON COLUMN registration_questions.question_type IS 'Tipo da pergunta: text, single_choice, multiple_choice';
COMMENT ON COLUMN registration_questions.options IS 'Array JSON com as opções de resposta (para single_choice e multiple_choice)';
COMMENT ON COLUMN registration_answers.answer_text IS 'Resposta em texto (para tipo text ou quando necessário)';
COMMENT ON COLUMN registration_answers.answer_options IS 'Array JSON com as opções selecionadas (para multiple_choice)';
