-- Seed 002: Evento de Exemplo

-- Inserir evento de exemplo
INSERT INTO events (title, description, date, location, price, max_participants, image_url)
VALUES (
  'Encontro de Jovens 2026',
  'Um encontro especial para os jovens da igreja com louvor, pregação e comunhão. Venha participar de momentos de adoração, estudos bíblicos profundos e muita comunhão fraterna!',
  '2026-03-15 19:00:00',
  'Igreja Central - Av. Principal, 123',
  50.00,
  200,
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Inserir configurações do evento (usando o evento criado acima)
INSERT INTO event_settings (
  event_id,
  event_subtitle,
  event_time,
  included_items,
  church_name,
  church_contact_phone,
  church_contact_email,
  church_instagram,
  church_facebook,
  church_website
)
SELECT 
  e.id,
  'Evento Especial 2026 - Transformando Vidas',
  '19h00 - Início das atividades',
  '[
    {"icon": "🛏️", "title": "Hospedagem Completa", "description": "Acomodações confortáveis durante todo o evento"},
    {"icon": "🍽️", "title": "Alimentação Incluída", "description": "Todas as refeições: café, almoço e jantar"},
    {"icon": "🎵", "title": "Momentos de Louvor", "description": "Adoração e música com bandas convidadas"},
    {"icon": "📖", "title": "Estudos Bíblicos", "description": "Aprofundamento espiritual com pregadores renomados"},
    {"icon": "🙏", "title": "Tempo de Oração", "description": "Momentos especiais de intercessão e busca"},
    {"icon": "👥", "title": "Comunhão Fraterna", "description": "Conexão e amizade com irmãos de todo o Brasil"}
  ]'::jsonb,
  'Igreja Central',
  '(11) 98765-4321',
  'contato@igrejacentral.com.br',
  '@igrejacentral',
  'igrejacentral',
  'https://igrejacentral.com.br'
FROM events e
WHERE e.title = 'Encontro de Jovens 2026'
AND NOT EXISTS (
  SELECT 1 FROM event_settings es WHERE es.event_id = e.id
);
