# Sistema de Inscrição para Eventos - Igreja

Sistema completo de gerenciamento de inscrições para eventos da igreja, com integração de pagamentos via Mercado Pago e banco de dados Postgres no Supabase.

## 🎨 Design

O sistema utiliza uma paleta de cores inspirada em:
- **Branco** (#FFFFFF)
- **Bege** (#F5F5DC)
- **Dourado** (#D4AF37)

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
- **Supabase Client** - Integração com banco de dados

### Integrações
- **Supabase** - Banco de dados Postgres
- **Mercado Pago** - Processamento de pagamentos
- **Backend Node.js** (preparado pelo usuário)

## 📦 Instalação

1. Clone o repositório
```bash
git clone [url-do-repositorio]
cd eventos
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo e configure suas credenciais
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_do_mercado_pago
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

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

## 🔐 Configuração do Backend

O sistema espera que o backend Node.js forneça os seguintes endpoints:

### Eventos
- `GET /api/events` - Lista todos os eventos
- `GET /api/events/:id` - Busca um evento específico

### Inscrições
- `POST /api/registrations` - Cria nova inscrição
- `GET /api/registrations` - Lista inscrições (requer autenticação)
- `PUT /api/registrations/:id` - Atualiza inscrição (requer autenticação)
- `PATCH /api/registrations/:id/checkin` - Realiza check-in (requer autenticação)

### Pagamentos
- `POST /api/payments` - Cria novo pagamento
- `GET /api/payments/:id` - Consulta status do pagamento

### Autenticação
- `POST /api/auth/login` - Login de administrador
- `GET /api/auth/verify` - Verifica token JWT

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

Toda a documentação está organizada na pasta [`docs/`](docs/):

- 📖 [`QUICKSTART.md`](docs/QUICKSTART.md) - Guia de início rápido
- ⚙️ [`SETUP.md`](docs/SETUP.md) - Configuração completa passo a passo
- 🏗️ [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Arquitetura e estrutura técnica
- 🔌 [`OFFLINE_MODE.md`](docs/OFFLINE_MODE.md) - Modo offline com mocks
- 💳 [`MERCADOPAGO_INTEGRATION.md`](docs/MERCADOPAGO_INTEGRATION.md) - Integração de pagamentos
- ⌨️ [`COMANDOS.md`](docs/COMANDOS.md) - Referência rápida de comandos
- 🎫 [`INGRESSO.md`](docs/INGRESSO.md) - Página de confirmação com ingresso
- 📋 [`PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md) - Resumo do projeto
- ✅ [`STATUS.md`](docs/STATUS.md) - Status e checklist do projeto

## 📞 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de TI da igreja.

---

Desenvolvido com ❤️ para a comunidade
