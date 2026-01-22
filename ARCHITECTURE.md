# Arquitetura do Sistema

Este documento descreve a arquitetura e estrutura do sistema de inscrições para eventos.

## 📐 Visão Geral

O sistema segue uma arquitetura cliente-servidor com:
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js (já preparado pelo usuário)
- **Banco de Dados:** PostgreSQL via Supabase
- **Pagamentos:** Mercado Pago API

## 🏗️ Estrutura de Pastas

```
eventos/
├── database/               # Scripts SQL do banco de dados
│   ├── schema.sql         # Definição das tabelas
│   ├── seed.sql           # Dados de exemplo
│   └── policies.sql       # Políticas de segurança RLS
│
├── public/                 # Arquivos estáticos públicos
│   └── vite.svg
│
├── src/
│   ├── assets/            # Recursos (imagens, ícones)
│   │   └── react.svg
│   │
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Header.tsx     # Cabeçalho da aplicação
│   │   ├── Header.css
│   │   ├── Footer.tsx     # Rodapé da aplicação
│   │   ├── Footer.css
│   │   ├── Loading.tsx    # Componente de carregamento
│   │   ├── Loading.css
│   │   ├── ProtectedRoute.tsx  # HOC para rotas protegidas
│   │   
│   ├── contexts/          # Context API para estado global
│   │   ├── AuthContext.tsx       # Autenticação e usuário
│   │   ├── EventContext.tsx      # Gerenciamento de eventos
│   │   └── RegistrationContext.tsx # Gerenciamento de inscrições
│   │
│   ├── pages/             # Páginas da aplicação
│   │   ├── Home.tsx       # Página inicial do evento
│   │   ├── Home.css
│   │   ├── Registration.tsx  # Inscrição em 2 etapas
│   │   ├── Registration.css
│   │   ├── Login.tsx      # Login administrativo
│   │   ├── Login.css
│   │   ├── Admin.tsx      # Painel administrativo
│   │   └── Admin.css
│   │
│   ├── services/          # Serviços de integração
│   │   ├── api.ts         # Cliente HTTP (Axios)
│   │   └── supabase.ts    # Cliente Supabase
│   │
│   ├── types/             # Definições TypeScript
│   │   └── index.ts       # Interfaces e tipos
│   │
│   ├── App.tsx            # Componente raiz com rotas
│   ├── App.css            # Estilos globais da aplicação
│   ├── main.tsx           # Entry point
│   ├── index.css          # CSS global e variáveis
│   └── vite-env.d.ts      # Tipos para variáveis de ambiente
│
├── .gitignore             # Arquivos ignorados pelo Git
├── env.example            # Exemplo de variáveis de ambiente
├── eslint.config.js       # Configuração do ESLint
├── index.html             # HTML principal
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração TypeScript
├── tsconfig.app.json      # Config TS para aplicação
├── tsconfig.node.json     # Config TS para Node
├── vite.config.ts         # Configuração Vite
├── README.md              # Documentação principal
├── SETUP.md               # Guia de configuração
└── ARCHITECTURE.md        # Este arquivo
```

## 🔄 Fluxo de Dados

### 1. Fluxo de Inscrição

```
Usuário → Home → Registration (Step 1) → API Backend → Database
                      ↓
           Registration (Step 2) → Mercado Pago → Confirmation
```

**Detalhamento:**
1. Usuário visualiza evento na página inicial
2. Clica em "Inscrever-se"
3. **Etapa 1:** Preenche dados pessoais
4. Dados são enviados ao backend via API
5. Backend salva no banco de dados (Supabase)
6. **Etapa 2:** Escolhe método de pagamento
7. Frontend cria requisição de pagamento via Mercado Pago
8. Backend processa pagamento
9. Webhook do Mercado Pago atualiza status
10. Confirmação enviada ao usuário

### 2. Fluxo de Autenticação

```
Admin → Login → Backend API → JWT Token → Protected Routes
```

**Detalhamento:**
1. Administrador acessa `/login`
2. Insere credenciais (email + senha)
3. Backend valida credenciais
4. Backend retorna JWT token + dados do usuário
5. Token é armazenado no localStorage
6. Token é incluído em todas as requisições subsequentes
7. ProtectedRoute valida token antes de renderizar

### 3. Fluxo do Painel Administrativo

```
Admin → Login → Admin Dashboard → CRUD Operations → Database
```

**Detalhamento:**
1. Admin faz login
2. Acessa `/admin` (rota protegida)
3. Dashboard carrega estatísticas
4. Lista todas as inscrições
5. Pode filtrar por status, check-in, buscar por nome/email/CPF
6. Pode editar inscrições
7. Pode fazer check-in
8. Todas as operações passam pelo backend

## 🧩 Componentes Principais

### Context API

#### AuthContext
- **Responsabilidade:** Gerenciar autenticação e usuário logado
- **Estado:**
  - `user`: Dados do usuário atual
  - `isAuthenticated`: Status de autenticação
  - `loading`: Status de carregamento
- **Métodos:**
  - `login()`: Fazer login
  - `logout()`: Fazer logout
  - `checkAuth()`: Verificar autenticação

#### EventContext
- **Responsabilidade:** Gerenciar eventos
- **Estado:**
  - `events`: Lista de eventos
  - `currentEvent`: Evento atual
  - `loading`: Status de carregamento
- **Métodos:**
  - `loadEvent()`: Carregar evento específico
  - `loadEvents()`: Carregar lista de eventos
  - `setCurrentEvent()`: Definir evento atual

#### RegistrationContext
- **Responsabilidade:** Gerenciar processo de inscrição
- **Estado:**
  - `formData`: Dados do formulário
  - `currentStep`: Etapa atual (1 ou 2)
  - `registrationId`: ID da inscrição criada
- **Métodos:**
  - `setFormData()`: Atualizar dados do formulário
  - `setCurrentStep()`: Mudar etapa
  - `resetRegistration()`: Resetar processo

### Serviços

#### api.ts
Cliente HTTP centralizado usando Axios com:
- Interceptor para adicionar token JWT
- Funções tipadas para cada endpoint
- Tratamento de erros

#### supabase.ts
Cliente Supabase para:
- Queries diretas ao banco (opcional)
- Realtime subscriptions (futuro)
- Storage (futuro)

## 🎨 Sistema de Design

### Paleta de Cores

```css
Primária:   #d4af37  (Dourado)
Secundária: #f5f5dc  (Bege)
Base:       #ffffff  (Branco)
Texto:      #333333  (Cinza escuro)
```

### Tipografia
- Font Family: System fonts (Apple, Segoe UI, Roboto)
- Títulos: Bold (600-700)
- Texto: Regular (400-500)

### Componentes de UI
- Botões: Gradiente dourado, bordas arredondadas, sombra
- Cards: Fundo branco, borda bege, sombra suave
- Inputs: Borda cinza, focus dourado
- Status badges: Cores semânticas (verde, amarelo, vermelho)

## 🔐 Segurança

### Frontend
- Validação de formulários
- Sanitização de inputs
- Tokens JWT no localStorage
- Rotas protegidas com ProtectedRoute

### Backend (Recomendado)
- Validação de dados
- Hash de senhas (bcrypt)
- JWT com expiração
- Rate limiting
- CORS configurado
- SQL injection prevention
- XSS protection

### Database (Supabase)
- Row Level Security (RLS)
- Políticas de acesso por role
- Índices para performance
- Triggers para auditoria

## 📊 Modelo de Dados

### Entidades Principais

```typescript
Event {
  id: UUID
  title: string
  description: text
  date: timestamp
  location: string
  price: decimal
  image_url?: string
  max_participants?: number
}

Registration {
  id: UUID
  event_id: UUID (FK)
  name: string
  email: string
  phone: string
  cpf: string
  address: text
  payment_status: enum
  payment_id?: string
  checked_in: boolean
}

User {
  id: UUID
  email: string (unique)
  password_hash: string
  role: enum (user, admin)
}
```

### Relacionamentos
- Event 1:N Registration
- Registration é independente de User (público)

## 🚀 Performance

### Otimizações Implementadas
- Code splitting por rota
- Lazy loading de componentes
- Context API evita prop drilling
- Axios interceptors evitam código duplicado
- CSS por componente (não global)
- Build otimizado com Vite

### Melhorias Futuras
- React.lazy() para páginas
- Paginação de inscrições
- Debounce em buscas
- Cache de requisições
- Service Worker
- Image optimization

## 🧪 Testing

### Estrutura de Testes (Futuro)
```
src/
├── components/__tests__/
├── pages/__tests__/
├── contexts/__tests__/
└── services/__tests__/
```

### Tipos de Testes Recomendados
- Unit tests: Jest + React Testing Library
- Integration tests: Cypress
- E2E tests: Playwright

## 📱 Responsividade

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Estratégias
- CSS Grid com auto-fit
- Flexbox para layouts
- Media queries
- Mobile-first approach

## 🔄 CI/CD (Recomendado)

### Pipeline Sugerido
1. Push para Git
2. Lint check
3. Type check
4. Build
5. Tests
6. Deploy

### Plataformas
- Frontend: Vercel, Netlify, GitHub Pages
- Backend: Heroku, Railway, AWS
- Database: Supabase (já em produção)

## 📚 Referências

- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Vite Docs](https://vitejs.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Mercado Pago Docs](https://www.mercadopago.com.br/developers)

---

Este documento é vivo e deve ser atualizado conforme o sistema evolui.
