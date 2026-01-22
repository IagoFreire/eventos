-- Script SQL para configurar Row Level Security (RLS) no Supabase

-- Habilitar RLS nas tabelas
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies para a tabela EVENTS
-- Todos podem ler eventos
CREATE POLICY "Eventos são públicos para leitura"
ON events FOR SELECT
USING (true);

-- Apenas administradores podem inserir, atualizar ou deletar eventos
CREATE POLICY "Apenas admins podem modificar eventos"
ON events FOR ALL
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Policies para a tabela REGISTRATIONS
-- Qualquer pessoa pode criar uma inscrição
CREATE POLICY "Qualquer pessoa pode criar inscrição"
ON registrations FOR INSERT
WITH CHECK (true);

-- Usuários podem ver suas próprias inscrições
CREATE POLICY "Usuários podem ver suas inscrições"
ON registrations FOR SELECT
USING (
  email = auth.jwt() ->> 'email' OR
  auth.jwt() ->> 'role' = 'admin'
);

-- Apenas administradores podem atualizar inscrições
CREATE POLICY "Apenas admins podem atualizar inscrições"
ON registrations FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

-- Apenas administradores podem deletar inscrições
CREATE POLICY "Apenas admins podem deletar inscrições"
ON registrations FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- Policies para a tabela USERS
-- Apenas administradores podem ler usuários
CREATE POLICY "Apenas admins podem ver usuários"
ON users FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Apenas administradores podem criar usuários
CREATE POLICY "Apenas admins podem criar usuários"
ON users FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Apenas administradores podem atualizar usuários
CREATE POLICY "Apenas admins podem atualizar usuários"
ON users FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

-- Apenas administradores podem deletar usuários
CREATE POLICY "Apenas admins podem deletar usuários"
ON users FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- Função para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
