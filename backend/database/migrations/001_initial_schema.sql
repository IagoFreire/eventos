-- Migration 001: Initial Schema
-- Criação das tabelas principais do sistema

-- Habilitar a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  max_participants INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Configurações dos Eventos
CREATE TABLE IF NOT EXISTS event_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  event_subtitle VARCHAR(255),
  event_time VARCHAR(50),
  included_items JSONB DEFAULT '[]',
  church_name VARCHAR(255) NOT NULL,
  church_contact_phone VARCHAR(20),
  church_contact_email VARCHAR(255),
  church_instagram VARCHAR(255),
  church_facebook VARCHAR(255),
  church_website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Inscrições
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  address TEXT,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  payment_id VARCHAR(100),
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Usuários (Administradores)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_event_settings_event_id ON event_settings(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_cpf ON registrations(cpf);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in ON registrations(checked_in);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_settings_updated_at ON event_settings;
CREATE TRIGGER update_event_settings_updated_at BEFORE UPDATE ON event_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE events IS 'Tabela de eventos da igreja';
COMMENT ON TABLE event_settings IS 'Configurações adicionais dos eventos';
COMMENT ON TABLE registrations IS 'Tabela de inscrições nos eventos';
COMMENT ON TABLE users IS 'Tabela de usuários administradores do sistema';
