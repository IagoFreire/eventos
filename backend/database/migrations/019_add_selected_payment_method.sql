-- Migration 019: Adicionar campo para método de pagamento selecionado pelo usuário
-- Este campo armazena a escolha do usuário (pix ou credit_card) independente do payment_method usado para controle interno

-- Adicionar coluna selected_payment_method (método de pagamento escolhido pelo usuário)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS selected_payment_method VARCHAR(50);

-- Comentário da coluna
COMMENT ON COLUMN registrations.selected_payment_method IS 'Método de pagamento escolhido pelo usuário na tela de confirmação (pix ou credit_card)';

-- Criar índice para facilitar consultas
CREATE INDEX IF NOT EXISTS idx_registrations_selected_payment_method ON registrations(selected_payment_method);
