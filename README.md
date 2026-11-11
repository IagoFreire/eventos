# Eventos

> Plataforma de inscrição para eventos com pagamento online (PIX e cartão via Mercado Pago), ingresso com QR Code e check-in por câmera.

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Mercado Pago](https://img.shields.io/badge/Mercado_Pago-00B1EA?style=flat&logo=mercadopago&logoColor=white)

Sistema completo, do formulário de inscrição até a portaria do evento: o participante se inscreve em etapas, paga por PIX ou cartão, recebe um ingresso com QR Code e, no dia, a equipe faz o check-in lendo o QR Code pela câmera do celular. Os organizadores acompanham tudo por um painel administrativo.

## Funcionalidades

**Para o participante**
- Inscrição em etapas: dados pessoais, perguntas personalizadas do evento e pagamento
- Pagamento via **PIX** (QR Code e copia e cola) ou **cartão de crédito** com parcelamento, usando o SDK do Mercado Pago
- Confirmação automática do PIX por **webhook** do Mercado Pago
- **Ingresso digital** com QR Code único, com opção de imprimir ou baixar em PDF
- Consulta do ingresso a qualquer momento pelo CPF ("Meu ingresso")

**Para o organizador**
- Login com **JWT** e rotas protegidas por perfil (admin)
- **Painel administrativo** com estatísticas do evento (inscritos, pagamentos aprovados, vagas restantes), filtro por status de pagamento e gestão das inscrições
- **Check-in por scanner** de QR Code direto no navegador, com bloqueio de check-in duplicado e de inscrições não pagas
- Configuração do evento pelo painel: título, imagem, datas, local, preço, limite de vagas, contatos, redes sociais e perguntas personalizadas (texto, escolha única ou múltipla)

**Para desenvolvimento**
- **Modo offline**: o frontend roda sem backend, com API simulada em `localStorage`, útil para demonstração
- Migrações SQL versionadas com controle de execução

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router 7, Tailwind CSS, Axios, html5-qrcode, qrcode.react, jsPDF |
| Backend | Node.js, Express, TypeScript, express-validator, bcrypt, JSON Web Token |
| Banco de dados | PostgreSQL (Supabase, via connection pooler) |
| Pagamentos | Mercado Pago (SDK JS no frontend, SDK Node no backend, webhooks) |
| Deploy | GitHub Actions, AWS Lightsail, PM2 |

## Arquitetura

```
┌──────────────────────┐   HTTPS/JSON   ┌──────────────────────┐     SQL     ┌──────────────────────┐
│  React SPA (Vite)    │ ─────────────▶ │  API Express (Node)  │ ──────────▶ │ PostgreSQL/Supabase  │
│  inscrição · admin   │                │  routes → controllers│             │ eventos · inscrições │
│  ingresso · check-in │                │  → models (pg)       │             │ perguntas · usuários │
└──────────┬───────────┘                └──────────┬───────────┘             └──────────────────────┘
           │ tokeniza o cartão                     │ cria pagamento / consulta status
           ▼                                       ▼
   ┌──────────────────────────────────────────────────────────┐
   │                       Mercado Pago                       │
   │   PIX · cartão · webhook de confirmação (de volta à API) │
   └──────────────────────────────────────────────────────────┘
```

- **Frontend** (`src/`): páginas em `pages/`, estado global com Context API (`contexts/`), cliente HTTP em `services/api.ts` e um seletor que troca a API real pela simulada no modo offline.
- **Backend** (`backend/src/`): camadas `routes` → `controllers` → `models`, com consultas SQL parametrizadas via `pg` e middlewares de autenticação, validação e tratamento de erros.
- **Pagamentos**: os dados do cartão são tokenizados no navegador pelo SDK do Mercado Pago e não passam pelo servidor. O PIX é confirmado pelo webhook, que consulta o status real do pagamento na API do Mercado Pago antes de liberar o ingresso.

## Estrutura de pastas

```
eventos/
├── src/                    # Frontend React
│   ├── components/         # Header, pagamento PIX/cartão, rotas protegidas...
│   ├── contexts/           # Auth, Event, Registration, Settings
│   ├── pages/              # Home, Inscrição, Confirmação, Meu Ingresso, Admin, Check-in
│   ├── services/           # API real, seletor de API, Mercado Pago, CEP
│   └── mocks/              # Dados e API do modo offline
├── backend/
│   ├── src/                # routes, controllers, models, middleware, config
│   ├── database/
│   │   ├── migrations/     # Migrações SQL versionadas
│   │   └── seeds/          # Admin e evento de exemplo
│   └── scripts/            # Utilitários (ex.: criar administrador)
├── docs/                   # Documentação detalhada (arquitetura, Mercado Pago, produção)
└── .github/workflows/      # Pipeline de deploy
```

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Um banco PostgreSQL (local ou um projeto gratuito no [Supabase](https://supabase.com))
- Opcional: conta de desenvolvedor no [Mercado Pago](https://www.mercadopago.com.br/developers) com credenciais de **teste**

### 1. Clonar e instalar

```bash
git clone https://github.com/IagoFreire/eventos.git
cd eventos
npm install
cd backend && npm install && cd ..
```

### 2. Configurar o backend

```bash
cp backend/env.example backend/.env
```

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta da API (padrão `3000`) |
| `NODE_ENV` | `development` ou `production` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexão com o PostgreSQL/Supabase |
| `JWT_SECRET` | Chave usada para assinar os tokens (use um valor longo e aleatório) |
| `JWT_EXPIRES_IN` | Validade do token (ex.: `7d`) |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token do Mercado Pago (use o de teste em desenvolvimento) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Assinatura secreta do webhook, usada para validar as notificações |
| `FRONTEND_URL` | URL do frontend liberada no CORS (ex.: `http://localhost:5173`) |
| `WEBHOOK_URL` | URL pública HTTPS do webhook (em desenvolvimento, use um túnel como o ngrok) |

Crie as tabelas e os dados iniciais e suba a API:

```bash
cd backend
npm run db:setup   # migrações + seed (admin e evento de exemplo)
npm run dev        # API em http://localhost:3000/api
```

O seed cria um administrador padrão (veja `backend/database/seeds/001_admin_user.sql`); para criar outro, use `npm run create-admin`. Troque a senha padrão antes de qualquer uso real.

### 3. Configurar o frontend

```bash
cp env.example .env
```

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL da API (ex.: `http://localhost:3000/api`) |
| `VITE_MERCADO_PAGO_PUBLIC_KEY` | Public key do Mercado Pago, do mesmo ambiente (teste ou produção) do access token |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Opcionais: dados do projeto Supabase |

```bash
npm run dev        # http://localhost:5173
```

### Só quer ver a interface?

```bash
npm install
npm run dev-offline
```

O modo offline dispensa backend, banco e Mercado Pago: tudo é simulado no navegador.

## Scripts

**Frontend (raiz)**

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento do Vite |
| `npm run dev-offline` | Frontend com API simulada, sem backend |
| `npm run build` | Checagem de tipos e build de produção |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | ESLint |

**Backend (`backend/`)**

| Script | O que faz |
| --- | --- |
| `npm run dev` | API com recarregamento automático (tsx watch) |
| `npm run build` / `npm start` | Compila o TypeScript e inicia a partir de `dist/` |
| `npm run migrate` | Executa as migrações pendentes |
| `npm run seed` | Insere os dados iniciais |
| `npm run db:setup` | Migrações + seed |
| `npm run create-admin` | Cria um usuário administrador |

## Deploy

O deploy é automático a cada push na branch `main`, pelo workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. O GitHub Actions gera o build do frontend com as variáveis de produção vindas dos *secrets* do repositório.
2. O `dist/` é enviado por SCP para uma instância **AWS Lightsail**, onde é servido como site estático.
3. Via SSH, o servidor atualiza o código, compila o backend e reinicia a API com o **PM2**.

*Secrets* usados: `VITE_API_URL`, `VITE_MERCADO_PAGO_PUBLIC_KEY`, `LIGHTSAIL_HOST`, `LIGHTSAIL_USER` e `LIGHTSAIL_SSH_KEY`. As variáveis do backend ficam no `.env` do servidor.

Mais detalhes em [`docs/CONFIGURACAO_PRODUCAO.md`](docs/CONFIGURACAO_PRODUCAO.md) e [`docs/MERCADOPAGO_INTEGRATION.md`](docs/MERCADOPAGO_INTEGRATION.md).

## Autor

**Iago Freire** · [GitHub](https://github.com/IagoFreire)
