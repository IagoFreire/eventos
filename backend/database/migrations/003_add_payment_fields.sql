-- Migration 003: Adicionar campos de detalhes de pagamento
-- Adiciona informações sobre método de pagamento, valor e data

-- Adicionar coluna payment_method (método de pagamento)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Adicionar coluna payment_amount (valor pago)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2);

-- Adicionar coluna payment_date (data do pagamento)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP;

-- Comentários das colunas
COMMENT ON COLUMN registrations.payment_method IS 'Método de pagamento usado (pix, credit_card, etc)';
COMMENT ON COLUMN registrations.payment_amount IS 'Valor pago pela inscrição';
COMMENT ON COLUMN registrations.payment_date IS 'Data e hora em que o pagamento foi aprovado';

-- Criar índice para facilitar consultas por método de pagamento
CREATE INDEX IF NOT EXISTS idx_registrations_payment_method ON registrations(payment_method);
