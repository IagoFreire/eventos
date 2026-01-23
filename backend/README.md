# Backend - Sistema de Gerenciamento de Eventos

Backend API RESTful desenvolvido em Node.js, Express e TypeScript para gerenciar eventos da igreja.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Superset JavaScript tipado
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Mercado Pago** - Integração de pagamentos
- **Bcrypt** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## ⚙️ Instalação

1. Instale as dependências:
```bash
cd backend
npm install
```

2. Configure o banco de dados PostgreSQL:
   - Crie um banco de dados chamado `eventos`
   - Configure as credenciais no arquivo `.env`

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventos
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

MERCADOPAGO_ACCESS_TOKEN=seu_token_do_mercado_pago

FRONTEND_URL=http://localhost:5173
```

4. Execute as migrações do banco de dados:
```bash
npm run migrate
```

Isso criará as tabelas e inserirá um usuário admin padrão:
- **Email**: admin@eventos.com
- **Senha**: admin123

## 🏃 Executando

### Modo Desenvolvimento
```bash
npm run dev
```

### Modo Produção
```bash
npm run build
npm start
```

A API estará disponível em `http://localhost:3000/api`

## 📚 Documentação da API

### Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@eventos.com",
  "password": "admin123"
}
```

#### Verificar Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

### Eventos

#### Listar Eventos
```http
GET /api/events
```

#### Buscar Evento
```http
GET /api/events/:id
```

#### Criar Evento (Admin)
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Encontro de Jovens",
  "description": "Descrição do evento",
  "date": "2026-03-15T19:00:00",
  "location": "Igreja Central",
  "price": 50.00,
  "max_participants": 200
}
```

#### Atualizar Evento (Admin)
```http
PUT /api/events/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### Buscar Configurações do Evento
```http
GET /api/events/:id/settings
```

#### Atualizar Configurações do Evento (Admin)
```http
PUT /api/events/:id/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "church_name": "Igreja Central",
  "church_contact_email": "contato@igreja.com",
  "included_items": [
    {
      "icon": "utensils",
      "title": "Alimentação",
      "description": "Café da manhã e almoço inclusos"
    }
  ]
}
```

### Inscrições

#### Criar Inscrição
```http
POST /api/registrations
Content-Type: application/json

{
  "event_id": "uuid-do-evento",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "address": "Rua Principal, 123"
}
```

#### Listar Inscrições (Admin)
```http
GET /api/registrations?event_id=uuid-do-evento
Authorization: Bearer {token}
```

#### Fazer Check-in (Admin)
```http
PATCH /api/registrations/:id/checkin
Authorization: Bearer {token}
```

### Pagamentos

#### Criar Pagamento
```http
POST /api/payments
Content-Type: application/json

{
  "registration_id": "uuid-da-inscricao",
  "transaction_amount": 50.00,
  "payment_method_id": "pix",
  "description": "Ingresso - Encontro de Jovens",
  "payer": {
    "email": "joao@example.com",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  }
}
```

#### Verificar Status do Pagamento
```http
GET /api/payments/:id
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

- **events** - Eventos da igreja
- **event_settings** - Configurações adicionais dos eventos
- **registrations** - Inscrições nos eventos
- **users** - Usuários administradores

### Relacionamentos

- `event_settings.event_id` → `events.id` (1:1)
- `registrations.event_id` → `events.id` (N:1)

## 🔒 Segurança

- Senhas hasheadas com bcrypt (custo 10)
- Autenticação via JWT
- Tokens com expiração configurável
- Validação de dados com express-validator
- CORS configurado
- Proteção de rotas admin

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia o servidor em produção
- `npm run migrate` - Executa as migrações do banco

## 🐛 Troubleshooting

### Erro de conexão com o banco
Verifique se o PostgreSQL está rodando e as credenciais no `.env` estão corretas.

### Erro ao criar tabelas
Certifique-se de ter criado o banco de dados antes de rodar as migrações.

### Erro no Mercado Pago
Verifique se o `MERCADOPAGO_ACCESS_TOKEN` está correto no `.env`.

## 📞 Suporte

Para problemas ou dúvidas, entre em contato com o desenvolvedor.
