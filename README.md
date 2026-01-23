# Sistema de Inscrição para Eventos - Igreja

Sistema completo de gerenciamento de inscrições para eventos da igreja, com integração de pagamentos via Mercado Pago e banco de dados Postgres no Supabase.

## 🎨 Design

✨ **NOVO!** Sistema atualizado com visual moderno baseado no modelo Figma!

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

### Página Inicial
- Apresentação do evento com imagem destacada
- Informações sobre data, local e valor
- Lista de itens incluídos no evento
- Call-to-action para inscrição

### Sistema de Inscrição (2 Etapas)
**Etapa 1 - Dados Pessoais:**
- Nome completo
- Email
- Telefone
- CPF
- Endereço completo

**Etapa 2 - Pagamento:**
- Resumo da inscrição
- Seleção de método de pagamento (PIX, Cartão, Boleto)
- Integração com Mercado Pago
- Confirmação do pagamento

### Painel Administrativo
- Dashboard com estatísticas de inscrições
- Visualização de todas as inscrições
- Filtros por status de pagamento e check-in
- Busca por nome, email ou CPF
- Edição de inscrições
- Sistema de check-in para o evento
- Atualização de status de pagamento

### Autenticação
- Sistema de login para administradores
- Proteção de rotas administrativas
- Gerenciamento de sessão com tokens

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** 19.2.0 com TypeScript
- **Vite** - Build tool
- **React Router DOM** - Gerenciamento de rotas
- **Context API** - Gerenciamento de estado
- **Axios** - Requisições HTTP
- **Tailwind CSS** - Framework CSS moderno e responsivo
- **Lucide React** - Biblioteca de ícones moderna
- **Class Variance Authority** - Gerenciamento de variantes de componentes

### Backend
- **Node.js** 18+ com TypeScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Bcrypt** - Hash de senhas
- **Mercado Pago SDK** - Processamento de pagamentos

### Integrações
- **PostgreSQL** - Banco de dados relacional
- **Mercado Pago** - Processamento de pagamentos
- **JWT** - Sistema de autenticação seguro

## ✨ Atualização Visual (Janeiro 2026)

O sistema foi completamente redesenhado com base no modelo Figma, trazendo:

- 🎨 **Design Moderno**: Interface glassmorphism com gradientes elegantes
- 📱 **Responsivo**: Otimizado para mobile, tablet e desktop
- ⚡ **Performance**: Tailwind CSS com tree-shaking automático
- 🎯 **UX Aprimorada**: Animações suaves e feedback visual claro
- 🔄 **100% Compatível**: Todas as funcionalidades foram preservadas

Para mais detalhes sobre a atualização, consulte [ATUALIZACAO_VISUAL.md](./ATUALIZACAO_VISUAL.md)

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
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventos
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta_super_segura
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercado_pago
```

**4. Configure o banco de dados**

```bash
cd backend
npm run migrate
```

**5. Inicie o sistema**

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

> 📚 Para guia detalhado, veja: [`INSTALACAO_BACKEND.md`](INSTALACAO_BACKEND.md)

### 🔌 Modo Offline (Opcional - Sem Backend)

Se preferir testar sem configurar o backend:

```bash
npm run dev-offline
```

Credenciais: `admin@igreja.com` / `admin123`

## 🏗️ Build e Deploy

O sistema oferece duas opções de build:

### 🌐 Build ONLINE (Produção com Supabase)
```bash
# Usando npm
npm run build:online

# Ou usando o script interativo (Windows)
.\build.bat
# Escolha opção 1

# PowerShell
.\build.ps1
# Escolha opção 1
```
Esta versão usa:
- ✅ Banco de dados Supabase (real)
- ✅ Autenticação real
- ✅ Integração com Mercado Pago
- ✅ Dados persistentes

### 🔌 Build OFFLINE (Demonstração com Mocks)
```bash
# Usando npm
npm run build:offline

# Ou usando o script interativo (Windows)
.\build.bat
# Escolha opção 2

# PowerShell
.\build.ps1
# Escolha opção 2
```
Esta versão usa:
- ✅ Dados mockados (simulados)
- ✅ Funciona sem internet
- ✅ Perfeito para demonstrações
- ✅ Não precisa configurar Supabase

**Credenciais do modo offline:**
- Email: `admin@igreja.com`
- Senha: `admin123`

### 📤 Deploy

Após o build, os arquivos estarão na pasta `dist/`. Você pode:

1. **Nginx** (como configurado):
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
src/
├── assets/          # Imagens e recursos estáticos
├── components/      # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Loading.tsx
├── contexts/        # Context API para gerenciamento de estado
│   ├── AuthContext.tsx
│   ├── EventContext.tsx
│   └── RegistrationContext.tsx
├── pages/          # Páginas da aplicação
│   ├── Home.tsx
│   ├── Registration.tsx
│   ├── Login.tsx
│   └── Admin.tsx
├── services/       # Serviços de integração
│   ├── api.ts
│   └── supabase.ts
├── types/          # Definições TypeScript
│   └── index.ts
├── App.tsx         # Componente principal com rotas
└── main.tsx        # Entry point da aplicação
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
│   ├── schema.sql       # Estrutura do banco
│   └── seed.sql         # Dados iniciais
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
- `GET /api/events/:id/settings` - Configurações do evento
- `PUT /api/events/:id/settings` - Atualizar configurações (admin)

**Inscrições**
- `POST /api/registrations` - Criar inscrição
- `GET /api/registrations` - Listar inscrições (admin)
- `PUT /api/registrations/:id` - Atualizar inscrição (admin)
- `PATCH /api/registrations/:id/checkin` - Check-in (admin)

**Pagamentos**
- `POST /api/payments` - Criar pagamento
- `GET /api/payments/:id` - Status do pagamento
- `POST /api/payments/webhook` - Webhook Mercado Pago

Para documentação completa: [`backend/README.md`](backend/README.md)

## 🗄️ Estrutura do Banco de Dados (Supabase/Postgres)

### Tabela: events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  price DECIMAL(10, 2),
  image_url VARCHAR(500),
  max_participants INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: registrations
```sql
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  address TEXT,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(100),
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Rotas da Aplicação

- `/` - Página inicial do evento
- `/inscricao` - Formulário de inscrição (2 etapas)
- `/confirmacao` - Página de confirmação com ingresso
- `/login` - Login administrativo
- `/admin` - Painel de administração (protegido)

## 💳 Integração com Mercado Pago

O sistema está preparado para integrar com a API do Mercado Pago. Para implementar completamente:

1. Obtenha suas credenciais no [Portal de Desenvolvedores do Mercado Pago](https://www.mercadopago.com.br/developers)
2. Configure a chave pública no arquivo `.env`
3. Implemente o processamento de pagamento no backend
4. Configure os webhooks para receber notificações de pagamento

## 🔒 Segurança

- Autenticação via JWT
- Proteção de rotas administrativas
- Validação de dados no frontend
- Armazenamento seguro de tokens
- Integração com Supabase RLS (Row Level Security)

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🎨 Paleta de Cores

```css
--color-primary: #d4af37        /* Dourado */
--color-primary-light: #f4d03f  /* Dourado claro */
--color-secondary: #f5f5dc      /* Bege */
--color-white: #ffffff          /* Branco */
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

# Preview da build
npm run preview

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

Veja a documentação completa em [`docs/OFFLINE_MODE.md`](docs/OFFLINE_MODE.md)

## 📄 Licença

Este projeto foi desenvolvido para uso interno da igreja.

## 👥 Contribuição

Para contribuir com o projeto:
1. Faça um fork
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📚 Documentação Completa

### 🔥 Documentação Backend (NOVO!)
- 🚀 [`INSTALACAO_BACKEND.md`](INSTALACAO_BACKEND.md) - **Guia completo de instalação do backend**
- 📖 [`backend/README.md`](backend/README.md) - Documentação técnica da API

### 📁 Documentação Frontend
Toda a documentação está organizada na pasta [`docs/`](docs/):

- 📖 [`QUICKSTART.md`](docs/QUICKSTART.md) - Guia de início rápido
- ⚙️ [`SETUP.md`](docs/SETUP.md) - Configuração completa passo a passo
- 🏗️ [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Arquitetura e estrutura técnica
- 🔌 [`OFFLINE_MODE.md`](docs/OFFLINE_MODE.md) - Modo offline com mocks
- 💳 [`MERCADOPAGO_INTEGRATION.md`](docs/MERCADOPAGO_INTEGRATION.md) - Integração de pagamentos
- ⌨️ [`COMANDOS.md`](docs/COMANDOS.md) - Referência rápida de comandos
- 🎫 [`INGRESSO.md`](docs/INGRESSO.md) - Página de confirmação com ingresso
- 📋 [`PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md) - Resumo do projeto

## 📞 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de TI da igreja.

---

Desenvolvido com ❤️ para a comunidade
