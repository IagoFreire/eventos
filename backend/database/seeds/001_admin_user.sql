-- Seed 001: Usuário Admin Padrão
-- Senha: admin123
-- NOTA: A senha está hasheada com bcrypt (custo 10)

INSERT INTO users (email, password_hash, role)
VALUES ('admin@eventos.com', '$2a$10$48.nLzbjYq1u5YaetE8BbulWB5fWjkz4la2K0kp0RKuLn8VYeuAqK', 'admin')
ON CONFLICT (email) DO NOTHING;
