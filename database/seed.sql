-- Script SQL para popular o banco de dados com dados de exemplo

-- Inserir um evento de exemplo
INSERT INTO events (title, description, date, location, price, image_url, max_participants)
VALUES (
  'Retiro Espiritual 2026',
  'Venha viver três dias de renovação espiritual, louvor e adoração. Um tempo especial de comunhão com Deus e com nossos irmãos em Cristo. Inclui alimentação completa, hospedagem e todas as atividades programadas.',
  '2026-03-15 09:00:00',
  'Centro de Retiros Nova Vida - Serra da Mantiqueira, MG',
  350.00,
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
  100
);

-- Inserir um usuário administrador de exemplo
-- Senha: admin123 (IMPORTANTE: Alterar no backend para usar hash bcrypt adequado)
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@igreja.com',
  '$2b$10$YourHashedPasswordHere', -- Substitua pelo hash bcrypt real
  'admin'
);

-- Inserir algumas inscrições de exemplo
INSERT INTO registrations (event_id, name, email, phone, cpf, address, payment_status, checked_in)
SELECT 
  e.id,
  'João Silva',
  'joao.silva@email.com',
  '(11) 98765-4321',
  '123.456.789-00',
  'Rua das Flores, 123, Centro, São Paulo, SP',
  'approved',
  false
FROM events e
WHERE e.title = 'Retiro Espiritual 2026'
LIMIT 1;

INSERT INTO registrations (event_id, name, email, phone, cpf, address, payment_status, checked_in)
SELECT 
  e.id,
  'Maria Santos',
  'maria.santos@email.com',
  '(11) 98765-1234',
  '987.654.321-00',
  'Av. Paulista, 1000, Bela Vista, São Paulo, SP',
  'approved',
  true
FROM events e
WHERE e.title = 'Retiro Espiritual 2026'
LIMIT 1;

INSERT INTO registrations (event_id, name, email, phone, cpf, address, payment_status, checked_in)
SELECT 
  e.id,
  'Pedro Oliveira',
  'pedro.oliveira@email.com',
  '(11) 98765-5678',
  '456.789.123-00',
  'Rua Augusta, 500, Consolação, São Paulo, SP',
  'pending',
  false
FROM events e
WHERE e.title = 'Retiro Espiritual 2026'
LIMIT 1;
