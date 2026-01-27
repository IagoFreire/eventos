# Backend - Sistema de Gerenciamento de Eventos

Backend API RESTful desenvolvido em Node.js, Express e TypeScript para gerenciar eventos da igreja.

## 🚀 Tecnologias

- **Node.js** 18+ - Runtime JavaScript
- **Express** 4.18.2 - Framework web
- **TypeScript** 5.3.3 - Superset JavaScript tipado
- **PostgreSQL** 14+ - Banco de dados relacional
- **JWT** (jsonwebtoken) 9.0.2 - Autenticação
- **Mercado Pago SDK** 2.0.15 - Integração de pagamentos
- **Bcrypt** (bcryptjs) 2.4.3 - Hash de senhas
- **Express Validator** 7.0.1 - Validação de dados
- **pg** 8.11.3 - Cliente PostgreSQL
- **CORS** 2.8.5 - Controle de acesso
- **dotenv** 16.3.1 - Variáveis de ambiente

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
   
   **Opção A: PostgreSQL Local**
   - Instale e configure PostgreSQL localmente
   - Crie um banco de dados chamado `eventos` (ou o nome que preferir)
   
   **Opção B: Supabase (PostgreSQL gerenciado)**
   - Crie um projeto no [Supabase](https://supabase.com)
   - Obtenha as credenciais de conexão (Connection Pooler)
   - Use o host do Connection Pooler do Supabase
   
   Configure as credenciais no arquivo `.env`

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

**Para PostgreSQL Local:**
```env
PORT=3000
NODE_ENV=development

# Banco de Dados PostgreSQL Local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventos
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_token_do_mercado_pago

# Frontend
FRONTEND_URL=http://localhost:5173
```

**Para Supabase (PostgreSQL gerenciado):**
```env
PORT=3000
NODE_ENV=development

# Banco de Dados Supabase (Connection Pooler)
DB_HOST=aws-0-us-west-2.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.seu_projeto_id
DB_PASSWORD=sua_senha_do_supabase

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_token_do_mercado_pago

# Frontend
FRONTEND_URL=http://localhost:5173
```

> 💡 **Nota:** O backend está configurado para funcionar com ambos. O código em `src/config/database.ts` já inclui configurações otimizadas para Supabase (Connection Pooler com limite de 5 conexões e SSL).

4. Execute as migrações do banco de dados:
```bash
npm run migrate
```

Isso criará todas as tabelas e inserirá um usuário admin padrão:
- **Email**: admin@eventos.com
- **Senha**: admin123

5. (Opcional) Execute os seeds para dados de exemplo:
```bash
npm run seed
```

## 🏃 Executando

### Modo Desenvolvimento
```bash
npm run dev
```

O servidor será iniciado com hot-reload usando `tsx watch`.

### Modo Produção
```bash
npm run build
npm start
```

A API estará disponível em `http://localhost:3000/api`

## 📚 Documentação da API

### Base URL
```
http://localhost:3000/api
```

### Autenticação

Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer {token}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@eventos.com",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@eventos.com",
    "role": "admin"
  }
}
```

#### Verificar Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

#### Registrar Novo Admin (requer admin)
```http
POST /api/auth/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "novo@admin.com",
  "password": "senha123"
}
```

#### Alterar Senha
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "senha_atual",
  "newPassword": "nova_senha"
}
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

#### Estatísticas do Evento
```http
GET /api/events/:id/stats
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "totalRegistrations": 150,
  "confirmedPayments": 120,
  "pendingPayments": 20,
  "checkedIn": 100,
  "availableSpots": 50
}
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
  "max_participants": 200,
  "image_url": "https://example.com/image.jpg"
}
```

#### Atualizar Evento (Admin)
```http
PUT /api/events/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### Deletar Evento (Admin)
```http
DELETE /api/events/:id
Authorization: Bearer {token}
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
  "church_contact_phone": "(11) 98765-4321",
  "church_instagram": "@igreja",
  "church_facebook": "igreja",
  "church_website": "https://igreja.com",
  "show_contact": true,
  "show_social": true,
  "included_items": [
    {
      "icon": "utensils",
      "title": "Alimentação",
      "description": "Café da manhã e almoço inclusos"
    }
  ],
  "event_title_text": "Encontro de Jovens",
  "event_title_image_url": "https://example.com/title.jpg",
  "event_title_font_size": 48,
  "event_title_font_weight": "bold",
  "event_title_color": "#D4AF37"
}
```

#### Buscar Datas do Evento
```http
GET /api/events/:id/dates
```

#### Atualizar Datas do Evento (Admin)
```http
PUT /api/events/:id/dates
Authorization: Bearer {token}
Content-Type: application/json

{
  "dates": [
    {
      "date": "2026-03-15T19:00:00",
      "description": "Abertura"
    },
    {
      "date": "2026-03-16T09:00:00",
      "description": "Palestras"
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
  "address": {
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipcode": "01234-567"
  },
  "answers": [
    {
      "question_id": "uuid",
      "answer": "Resposta"
    }
  ]
}
```

#### Listar Inscrições (Admin)
```http
GET /api/registrations?event_id=uuid-do-evento
Authorization: Bearer {token}
```

**Query Parameters:**
- `event_id` (opcional) - Filtrar por evento
- `payment_status` (opcional) - Filtrar por status (pending, approved, rejected)
- `checked_in` (opcional) - Filtrar por check-in (true/false)

#### Buscar Inscrição por ID (Admin)
```http
GET /api/registrations/:id
Authorization: Bearer {token}
```

#### Buscar Inscrições por CPF
```http
GET /api/registrations/by-cpf?cpf=12345678900
```

#### Buscar Inscrições Pendentes por Email
```http
GET /api/registrations/pending-by-email?email=joao@example.com
```

#### Atualizar Inscrição (Admin)
```http
PUT /api/registrations/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### Atualizar Método de Pagamento
```http
PATCH /api/registrations/:id/payment-method
Content-Type: application/json

{
  "payment_method": "pix"
}
```

#### Verificar Status de Pagamento
```http
GET /api/registrations/:id/check-payment
```

#### Fazer Check-in (Admin)
```http
PATCH /api/registrations/:id/checkin
Authorization: Bearer {token}
```

#### Fazer Check-in Apenas (Admin)
```http
PATCH /api/registrations/:id/checkin-only
Authorization: Bearer {token}
```

#### Deletar Inscrição (Admin)
```http
DELETE /api/registrations/:id
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

#### Buscar Parcelas Disponíveis
```http
GET /api/payments/installments?amount=50.00&payment_method_id=credit_card
```

#### Verificar Status do Pagamento
```http
GET /api/payments/:id
```

#### Webhook Mercado Pago
```http
POST /api/payments/webhook
Content-Type: application/json

{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

### Perguntas de Inscrição

#### Listar Perguntas do Evento
```http
GET /api/registration-questions/event/:eventId
```

#### Buscar Pergunta por ID
```http
GET /api/registration-questions/:id
```

#### Criar Pergunta (Admin)
```http
POST /api/registration-questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "event_id": "uuid-do-evento",
  "question": "Qual sua idade?",
  "type": "text",
  "required": true,
  "order": 1
}
```

#### Atualizar Pergunta (Admin)
```http
PUT /api/registration-questions/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### Deletar Pergunta (Admin)
```http
DELETE /api/registration-questions/:id
Authorization: Bearer {token}
```

#### Reordenar Perguntas (Admin)
```http
PUT /api/registration-questions/event/:eventId/reorder
Authorization: Bearer {token}
Content-Type: application/json

{
  "question_ids": ["uuid1", "uuid2", "uuid3"]
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **events** - Eventos
- **event_settings** - Configurações dos eventos
- **event_dates** - Datas dos eventos
- **registrations** - Inscrições
- **registration_answers** - Respostas às perguntas
- **registration_questions** - Perguntas personalizadas
- **users** - Usuários administradores
- **payments** - Registros de pagamentos
- **confirmed_participants** - Participantes confirmados
- **migrations** - Controle de migrações

### Migrações

O sistema utiliza um sistema de migrações versionadas. As migrações estão em `database/migrations/`:

1. `001_initial_schema.sql` - Schema inicial
2. `002_create_migrations_table.sql` - Tabela de controle
3. `003_add_payment_fields.sql` - Campos de pagamento
4. `004_add_checkin_date.sql` - Data de check-in
5. `005_add_event_dates.sql` - Datas do evento
6. `006_add_show_contact_social.sql` - Flags de exibição
7. `007_add_individual_show_fields.sql` - Campos individuais
8. `008_add_confirmed_participants.sql` - Participantes confirmados
9. `009_add_show_sections_flags.sql` - Flags de seções
10. `010_remove_address_column.sql` - Remoção de coluna
11. `011_add_registration_questions.sql` - Perguntas de inscrição
12. `012_add_event_title_image_url.sql` - Imagem do título
13. `013_add_event_title_customization.sql` - Customização do título
14. `014_add_event_title_font_weight.sql` - Peso da fonte
15. `016_restore_email_to_registrations.sql` - Restaurar email
16. `017_add_contact_phones.sql` - Telefones de contato
17. `018_add_show_available_spots.sql` - Exibir vagas disponíveis
18. `019_add_selected_payment_method.sql` - Método de pagamento selecionado

### Relacionamentos

- `event_settings.event_id` → `events.id` (1:1)
- `event_dates.event_id` → `events.id` (N:1)
- `registrations.event_id` → `events.id` (N:1)
- `registration_answers.registration_id` → `registrations.id` (N:1)
- `registration_answers.question_id` → `registration_questions.id` (N:1)
- `registration_questions.event_id` → `events.id` (N:1)
- `payments.registration_id` → `registrations.id` (N:1)

## 🔒 Segurança

### Autenticação
- Senhas hasheadas com bcrypt (custo 10)
- Autenticação via JWT
- Tokens com expiração configurável (padrão: 7 dias)
- Middleware de autenticação em rotas protegidas

### Validação
- Validação de dados com express-validator
- Sanitização de inputs
- Validação de tipos e formatos

### CORS
- CORS configurado com origens permitidas
- Suporte a múltiplos domínios
- Configuração flexível para desenvolvimento e produção

### Proteção de Rotas
- Middleware `authenticateToken` para verificar JWT
- Middleware `requireAdmin` para rotas administrativas
- Validação de permissões por role

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento (hot-reload)
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia o servidor em produção
- `npm run migrate` - Executa as migrações do banco
- `npm run seed` - Insere dados de exemplo
- `npm run db:setup` - Executa migrate + seed
- `npm run db:reset` - Reseta o banco (CUIDADO: apaga todos os dados)
- `npm run create-admin` - Cria um novo usuário admin

## 🏗️ Estrutura do Código

```
backend/
├── src/
│   ├── config/              # Configurações
│   │   ├── database.ts      # Configuração do PostgreSQL
│   │   └── mercadopago.ts   # Configuração do Mercado Pago
│   │
│   ├── controllers/         # Lógica de negócio
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── registration.controller.ts
│   │   └── registration-question.controller.ts
│   │
│   ├── models/              # Modelos de dados
│   │   ├── event.model.ts
│   │   ├── registration.model.ts
│   │   ├── user.model.ts
│   │   ├── payment.model.ts
│   │   └── registration-question.model.ts
│   │
│   ├── routes/              # Rotas da API
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   ├── registration.routes.ts
│   │   ├── payment.routes.ts
│   │   └── registration-question.routes.ts
│   │
│   ├── middleware/          # Middlewares
│   │   ├── auth.ts          # Autenticação JWT
│   │   ├── errorHandler.ts  # Tratamento de erros
│   │   └── validation.ts    # Validação de dados
│   │
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts
│   │
│   └── server.ts            # Servidor Express
│
├── database/
│   ├── migrations/          # Migrações do banco
│   ├── seeds/              # Dados iniciais
│   ├── migrate.ts          # Script de migração
│   └── seed.ts             # Script de seed
│
├── scripts/
│   └── create-admin.ts     # Script para criar admin
│
├── dist/                    # Código compilado (gerado)
├── env.example             # Exemplo de variáveis de ambiente
├── package.json
└── tsconfig.json           # Configuração TypeScript
```

## 🐛 Troubleshooting

### Erro de conexão com o banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `psql -h localhost -U postgres -d eventos`

### Erro ao criar tabelas
- Certifique-se de ter criado o banco de dados
- Verifique se o usuário tem permissões adequadas
- Execute `npm run migrate` novamente

### Erro no Mercado Pago
- Verifique se o `MERCADOPAGO_ACCESS_TOKEN` está correto no `.env`
- Confirme se está usando credenciais de teste ou produção
- Verifique os logs do servidor para mais detalhes

### Erro de CORS
- Adicione a URL do frontend em `FRONTEND_URL` no `.env`
- Verifique se a origem está na lista de `allowedOrigins` em `server.ts`

### Token JWT inválido
- Verifique se o `JWT_SECRET` está configurado
- Confirme se o token não expirou
- Verifique se o header `Authorization` está sendo enviado corretamente

## 📞 Suporte

Para problemas ou dúvidas:
- Consulte a documentação principal: [`../README.md`](../README.md)
- Veja a documentação de configuração: [`../docs/CONFIGURACAO_PRODUCAO.md`](../docs/CONFIGURACAO_PRODUCAO.md)
- Entre em contato com o desenvolvedor

---

Desenvolvido com ❤️ para a comunidade
