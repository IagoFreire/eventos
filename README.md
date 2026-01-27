# Sistema de Inscrição para Eventos - Igreja

Sistema completo de gerenciamento de inscrições para eventos da igreja, com integração de pagamentos via Mercado Pago e banco de dados PostgreSQL (pode ser local ou via Supabase).

## 🎨 Design

✨ **Sistema atualizado com visual moderno baseado no modelo Figma!**

O sistema utiliza uma paleta de cores elegante e moderna:
- **Dourado Principal** (#D4AF37)
- **Dourado Escuro** (#B8860B)
- **Bege Claro** (#F5F5DC)
- **Bege Escuro** (#E8DCC4)
- **Branco** (#FFFFFF)

### Características Visuais:
- 🎨 Design glassmorphism com backdrop blur
- ✨ Gradientes suaves e animações fluidas
- 🎯 Ícones modernos do Lucide React
- 📱 Totalmente responsivo (mobile, tablet, desktop)
- 🌟 Interface limpa e profissional

## 📋 Funcionalidades

### Página Inicial (`/`)
- Apresentação do evento com imagem destacada
- Informações sobre data, local e valor
- Lista de itens incluídos no evento
- Call-to-action para inscrição
- Visualização de datas do evento
- Informações de contato e redes sociais

### Sistema de Inscrição (`/inscricao`)
**Etapa 1 - Dados Pessoais:**
- Nome completo
- Email
- Telefone (WhatsApp)
- CPF
- Respostas a perguntas personalizadas do evento

**Etapa 2 - Pagamento:**
- Resumo da inscrição
- Seleção de método de pagamento (PIX, Cartão de Crédito)
- Integração completa com Mercado Pago
- Confirmação do pagamento
- Geração de QR Code para PIX
- Processamento de cartão de crédito

### Página de Confirmação (`/confirmacao`)
- Exibição do ingresso com QR Code
- Informações do participante
- Detalhes do evento
- Opção de impressão e download em PDF
- Link para consultar ingresso posteriormente

### Consulta de Ingresso (`/meu-ingresso`)
- Busca de ingressos por CPF
- Visualização de todos os ingressos do participante
- Reimpressão de ingressos
- Download em PDF

### Painel Administrativo (`/admin`)
- Dashboard com estatísticas de inscrições
- Visualização de todas as inscrições
- Filtros por status de pagamento e check-in
- Busca por nome, email ou CPF
- Edição de inscrições
- Atualização de status de pagamento
- Exportação de dados

### Configurações do Evento (`/admin/configuracoes`)
- Configuração de informações do evento
- Dados da igreja (nome, contato, redes sociais)
- Gerenciamento de itens incluídos
- Configuração de datas do evento
- Gerenciamento de participantes confirmados
- Perguntas personalizadas de inscrição
- Personalização visual (título, imagem, fontes)

### Sistema de Check-in (`/admin/checkin`)
- Scanner de QR Code para check-in rápido
- Busca manual por CPF ou nome
- Visualização de informações do participante
- Confirmação de presença
- Histórico de check-ins

### Autenticação (`/login`)
- Sistema de login para administradores
- Proteção de rotas administrativas
- Gerenciamento de sessão com tokens JWT
- Verificação de permissões

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** 19.2.0 com TypeScript
- **Vite** 7.2.4 - Build tool moderna e rápida
- **React Router DOM** 7.12.0 - Gerenciamento de rotas
- **Context API** - Gerenciamento de estado global
- **Axios** 1.13.2 - Requisições HTTP
- **Tailwind CSS** 3.4.1 - Framework CSS moderno e responsivo
- **Lucide React** 0.562.0 - Biblioteca de ícones moderna
- **React Toastify** 11.0.5 - Notificações elegantes
- **Mercado Pago SDK React** 1.0.7 - Integração de pagamentos
- **QRCode React** 4.2.0 - Geração de QR Codes
- **html5-qrcode** 2.3.8 - Scanner de QR Codes
- **jsPDF** 4.0.0 - Geração de PDFs
- **html2canvas** 1.4.1 - Captura de tela para PDF

### Backend
- **Node.js** 18+ com TypeScript
- **Express** 4.18.2 - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** (jsonwebtoken) 9.0.2 - Autenticação e autorização
- **Bcrypt** (bcryptjs) 2.4.3 - Hash de senhas
- **Mercado Pago SDK** 2.0.15 - Processamento de pagamentos
- **Express Validator** 7.0.1 - Validação de dados
- **pg** 8.11.3 - Cliente PostgreSQL

### Integrações
- **PostgreSQL** - Banco de dados relacional (pode ser local ou via Supabase)
- **Supabase** - Opcional: pode ser usado como host do PostgreSQL pelo backend
- **Mercado Pago** - Processamento de pagamentos (PIX e Cartão)
- **JWT** - Sistema de autenticação seguro

## ✨ Atualização Visual (Janeiro 2026)

O sistema foi completamente redesenhado com base no modelo Figma, trazendo:

- 🎨 **Design Moderno**: Interface glassmorphism com gradientes elegantes
- 📱 **Responsivo**: Otimizado para mobile, tablet e desktop
- ⚡ **Performance**: Tailwind CSS com tree-shaking automático
- 🎯 **UX Aprimorada**: Animações suaves e feedback visual claro
- 🔄 **100% Compatível**: Todas as funcionalidades foram preservadas

Para mais detalhes sobre a atualização, consulte [docs/ATUALIZACAO_VISUAL.md](./docs/ATUALIZACAO_VISUAL.md)

## 📦 Instalação

### 🎯 Instalação Rápida com Backend Integrado

**1. Clone o repositório**
```bash
git clone [url-do-repositorio]
cd eventos
```

**2. Instale as dependências do frontend**
```bash
npm install
```

**3. Configure o backend**
```bash
cd backend
npm install
cp env.example .env
```

Edite `backend/.env` com suas credenciais:

**Opção 1: PostgreSQL Local**
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventos
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=7d

MERCADOPAGO_ACCESS_TOKEN=seu_token_mercado_pago

FRONTEND_URL=http://localhost:5173
```

**Opção 2: Supabase (PostgreSQL gerenciado)**
```env
PORT=3000
NODE_ENV=development

# Banco de Dados Supabase (Connection Pooler)
DB_HOST=aws-0-us-west-2.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.seu_projeto_id
DB_PASSWORD=sua_senha_do_supabase

JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=7d

MERCADOPAGO_ACCESS_TOKEN=seu_token_mercado_pago

FRONTEND_URL=http://localhost:5173
```

> 💡 **Dica:** O backend suporta tanto PostgreSQL local quanto Supabase. Use o que preferir!

**4. Configure o frontend**

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:3000/api
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_mercado_pago
```

> **Nota:** O frontend não precisa de variáveis do Supabase, pois usa apenas a API do backend. O backend pode usar Supabase como host do PostgreSQL, mas isso é configurado apenas no `backend/.env`.

**5. Configure o banco de dados**

```bash
cd backend
npm run migrate
```

Isso criará todas as tabelas e inserirá um usuário admin padrão:
- **Email**: admin@eventos.com
- **Senha**: admin123

**6. Inicie o sistema**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

🎉 **Pronto!** Acesse: http://localhost:5173

**Credenciais padrão:**
- Email: `admin@eventos.com`
- Senha: `admin123`

> 📚 Para guia detalhado, veja: [`docs/CONFIGURACAO_PRODUCAO.md`](./docs/CONFIGURACAO_PRODUCAO.md)

### 🔌 Modo Offline (Opcional - Sem Backend)

Se preferir testar sem configurar o backend:

```bash
npm run dev-offline
```

**Credenciais do modo offline:**
- Email: `admin@igreja.com`
- Senha: `admin123`

Veja a documentação completa em [`docs/OFFLINE_MODE.md`](./docs/OFFLINE_MODE.md)

## 🏗️ Build e Deploy

O sistema oferece duas opções de build:

### 🌐 Build ONLINE (Produção com Backend)
```bash
# Usando npm
npm run build

# Preview da build
npm run preview
```

Esta versão usa:
- ✅ Banco de dados PostgreSQL (real)
- ✅ Autenticação real
- ✅ Integração com Mercado Pago
- ✅ Dados persistentes

### 🔌 Build OFFLINE (Demonstração com Mocks)
```bash
# Usando npm
npm run build:offline

# Preview da build offline
npm run preview:offline
```

Esta versão usa:
- ✅ Dados mockados (simulados)
- ✅ Funciona sem internet
- ✅ Perfeito para demonstrações
- ✅ Não precisa configurar backend

**Credenciais do modo offline:**
- Email: `admin@igreja.com`
- Senha: `admin123`

### 📤 Deploy

Após o build, os arquivos estarão na pasta `dist/`. Você pode:

1. **Nginx**:
   ```bash
   # Copie os arquivos para a pasta do nginx
   # Configure o nginx.conf apontando para dist/
   # Recarregue o nginx
   nginx -s reload
   ```

2. **Outros servidores**:
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy --prod`
   - GitHub Pages: Configure o workflow

## 🗂️ Estrutura do Projeto

```
eventos/
├── backend/              # Backend Node.js/Express
│   ├── src/
│   │   ├── config/       # Configurações (DB, Mercado Pago)
│   │   ├── controllers/  # Lógica de negócio
│   │   ├── models/       # Modelos de dados
│   │   ├── routes/       # Rotas da API
│   │   ├── middleware/   # Auth, validação, erros
│   │   └── server.ts     # Servidor Express
│   ├── database/
│   │   ├── migrations/   # Migrações do banco
│   │   └── seeds/        # Dados iniciais
│   └── package.json
│
├── src/                  # Frontend React
│   ├── assets/          # Imagens e recursos estáticos
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Loading.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── PixPayment.tsx
│   │   ├── CreditCardPayment.tsx
│   │   └── CreditCardVisual.tsx
│   ├── contexts/        # Context API para estado global
│   │   ├── AuthContext.tsx
│   │   ├── EventContext.tsx
│   │   ├── RegistrationContext.tsx
│   │   └── SettingsContext.tsx
│   ├── pages/          # Páginas da aplicação
│   │   ├── Home.tsx
│   │   ├── Registration.tsx
│   │   ├── Confirmation.tsx
│   │   ├── MeuIngresso.tsx
│   │   ├── Login.tsx
│   │   ├── Admin.tsx
│   │   ├── AdminSettings.tsx
│   │   └── CheckIn.tsx
│   ├── services/       # Serviços de integração
│   │   ├── api.ts
│   │   ├── apiSelector.ts
│   │   └── mercadopago-config.ts
│   ├── types/          # Definições TypeScript
│   │   └── index.ts
│   ├── utils/          # Utilitários
│   │   ├── formatPrice.ts
│   │   └── generateTestData.ts
│   ├── App.tsx         # Componente principal com rotas
│   └── main.tsx        # Entry point da aplicação
│
├── docs/               # Documentação completa
├── public/             # Arquivos estáticos públicos
└── package.json
```

## 🔐 Backend API

O backend está **totalmente implementado** e integrado! 🎉

### Estrutura do Backend

```
backend/
├── src/
│   ├── config/          # Configurações (DB, Mercado Pago)
│   ├── controllers/     # Lógica de negócio
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── middleware/      # Auth, validação, erros
│   └── server.ts        # Servidor Express
├── database/
│   ├── migrations/      # Migrações do banco
│   └── seeds/           # Dados iniciais
└── package.json
```

### Endpoints da API

**Autenticação**
- `POST /api/auth/login` - Login de administrador
- `GET /api/auth/verify` - Verificar token JWT
- `POST /api/auth/register` - Criar novo admin (requer admin)

**Eventos**
- `GET /api/events` - Listar todos os eventos
- `GET /api/events/:id` - Buscar evento específico
- `POST /api/events` - Criar evento (admin)
- `PUT /api/events/:id` - Atualizar evento (admin)
- `DELETE /api/events/:id` - Deletar evento (admin)
- `GET /api/events/:id/settings` - Configurações do evento
- `PUT /api/events/:id/settings` - Atualizar configurações (admin)

**Inscrições**
- `POST /api/registrations` - Criar inscrição
- `GET /api/registrations` - Listar inscrições (admin)
- `GET /api/registrations/:id` - Buscar inscrição específica
- `PUT /api/registrations/:id` - Atualizar inscrição (admin)
- `DELETE /api/registrations/:id` - Deletar inscrição (admin)
- `PATCH /api/registrations/:id/checkin` - Check-in (admin)
- `GET /api/registrations/cpf/:cpf` - Buscar inscrições por CPF

**Pagamentos**
- `POST /api/payments` - Criar pagamento
- `GET /api/payments/:id` - Status do pagamento
- `POST /api/payments/webhook` - Webhook Mercado Pago

**Perguntas de Inscrição**
- `GET /api/events/:id/registration-questions` - Listar perguntas
- `POST /api/events/:id/registration-questions` - Criar pergunta (admin)
- `PUT /api/registration-questions/:id` - Atualizar pergunta (admin)
- `DELETE /api/registration-questions/:id` - Deletar pergunta (admin)

Para documentação completa: [`backend/README.md`](./backend/README.md)

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza PostgreSQL gerenciado pelo backend. Para ver a estrutura completa das tabelas e migrações, consulte [`backend/README.md`](./backend/README.md) e as migrações em `backend/database/migrations/`.

## 🎯 Rotas da Aplicação

### Rotas Públicas
- `/` - Página inicial do evento
- `/inscricao` - Formulário de inscrição (2 etapas)
- `/confirmacao` - Página de confirmação com ingresso
- `/meu-ingresso` - Consulta de ingressos por CPF
- `/login` - Login administrativo

### Rotas Protegidas (Admin)
- `/admin` - Painel de administração
- `/admin/configuracoes` - Configurações do evento
- `/admin/checkin` - Sistema de check-in com QR Code

## 💳 Integração com Mercado Pago

O sistema possui integração completa com Mercado Pago para processamento de pagamentos:

### Métodos de Pagamento Suportados
- **PIX**: Geração automática de QR Code e verificação de pagamento
- **Cartão de Crédito**: Processamento seguro via SDK oficial do Mercado Pago

### Configuração

1. Obtenha suas credenciais no [Portal de Desenvolvedores do Mercado Pago](https://www.mercadopago.com.br/developers)
2. Configure as chaves no arquivo `.env`:
   - `MERCADOPAGO_ACCESS_TOKEN` (backend)
   - `VITE_MERCADO_PAGO_PUBLIC_KEY` (frontend)
3. Configure os webhooks para receber notificações de pagamento

Para documentação completa, veja: [`docs/MERCADOPAGO_INTEGRATION.md`](./docs/MERCADOPAGO_INTEGRATION.md)

## 🔒 Segurança

### Frontend
- Autenticação via JWT
- Proteção de rotas administrativas
- Validação de dados nos formulários
- Sanitização de inputs
- Armazenamento seguro de tokens

### Backend
- Senhas hasheadas com bcrypt
- Autenticação via JWT com expiração
- Validação de dados com express-validator
- CORS configurado
- Proteção de rotas admin
- Prevenção de SQL injection
- Rate limiting (recomendado)

### Banco de Dados
- Migrações versionadas
- Índices otimizados
- Constraints de integridade
- Validação de dados no nível do banco

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- **Mobile** (< 768px)
- **Tablet** (768px - 1024px)
- **Desktop** (> 1024px)

## 🎨 Paleta de Cores

```css
--color-primary: #D4AF37        /* Dourado Principal */
--color-primary-dark: #B8860B  /* Dourado Escuro */
--color-secondary: #F5F5DC      /* Bege Claro */
--color-secondary-dark: #E8DCC4 /* Bege Escuro */
--color-white: #FFFFFF         /* Branco */
--color-text: #333333           /* Texto escuro */
```

## 🚧 Desenvolvimento

```bash
# Modo desenvolvimento (requer backend)
npm run dev

# Modo desenvolvimento OFFLINE (sem backend - usa mocks)
npm run dev-offline

# Build para produção
npm run build

# Build offline
npm run build:offline

# Preview da build
npm run preview

# Preview offline
npm run preview:offline

# Lint
npm run lint
```

### 🔌 Modo Offline

O sistema pode funcionar **100% offline** usando dados mockados!

```bash
npm run dev-offline
```

**Credenciais de teste:**
- Email: `admin@igreja.com`
- Senha: `admin123`

Veja a documentação completa em [`docs/OFFLINE_MODE.md`](./docs/OFFLINE_MODE.md)

## 📚 Documentação Completa

### 🔥 Documentação Backend
- 🚀 [`backend/README.md`](./backend/README.md) - Documentação técnica da API
- 📖 [`docs/CONFIGURACAO_PRODUCAO.md`](./docs/CONFIGURACAO_PRODUCAO.md) - Guia completo de configuração

### 📁 Documentação Frontend
Toda a documentação está organizada na pasta [`docs/`](./docs/):

- 📖 [`docs/README.md`](./docs/README.md) - Índice da documentação
- ⚡ [`docs/COMANDOS.md`](./docs/COMANDOS.md) - Referência rápida de comandos
- 🏗️ [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - Arquitetura e estrutura técnica
- 🔌 [`docs/OFFLINE_MODE.md`](./docs/OFFLINE_MODE.md) - Modo offline com mocks
- 💳 [`docs/MERCADOPAGO_INTEGRATION.md`](./docs/MERCADOPAGO_INTEGRATION.md) - Integração de pagamentos
- 🎫 [`docs/INGRESSO.md`](./docs/INGRESSO.md) - Página de confirmação com ingresso
- 📋 [`docs/PROJECT_SUMMARY.md`](./docs/PROJECT_SUMMARY.md) - Resumo do projeto
- 🎨 [`docs/ATUALIZACAO_VISUAL.md`](./docs/ATUALIZACAO_VISUAL.md) - Atualização visual
- 🧪 [`docs/TESTE_PIX_LOCAL.md`](./docs/TESTE_PIX_LOCAL.md) - Testes de PIX local

## 🐛 Troubleshooting

### Erro de conexão com o backend
- Verifique se o backend está rodando na porta 3000
- Confirme se `VITE_API_URL` está correto no `.env`

### Erro de conexão com o banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `backend/.env`

### Erro no Mercado Pago
- Verifique se as chaves estão corretas
- Confirme se está usando credenciais de teste ou produção

### Problemas com migrações
- Certifique-se de ter criado o banco de dados
- Execute `npm run migrate` novamente

## 📄 Licença

Este projeto foi desenvolvido para uso interno da igreja.

## 👥 Contribuição

Para contribuir com o projeto:
1. Faça um fork
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de TI da igreja.

---

Desenvolvido com ❤️ para a comunidade
