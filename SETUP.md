# Guia de Configuração do Sistema

Este guia irá ajudá-lo a configurar completamente o sistema de inscrições para eventos.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Conta no Mercado Pago (para pagamentos)
- Backend Node.js configurado

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL do projeto e a chave anônima (anon key)

### 2. Executar Scripts SQL

No painel do Supabase, vá em "SQL Editor" e execute os scripts na seguinte ordem:

#### Passo 1: Criar Schema
Execute o arquivo `database/schema.sql` para criar todas as tabelas.

#### Passo 2: Configurar Políticas de Segurança (Opcional)
Execute o arquivo `database/policies.sql` para configurar Row Level Security.

#### Passo 3: Popular com Dados de Exemplo (Opcional)
Execute o arquivo `database/seed.sql` para adicionar dados de exemplo.

**IMPORTANTE:** Antes de executar o seed.sql, você precisa gerar o hash da senha do administrador usando bcrypt no backend.

## 🔐 Configuração do Backend

### 1. Criar Usuário Administrador

No seu backend Node.js, execute este código para gerar o hash da senha:

```javascript
const bcrypt = require('bcrypt');
const password = 'admin123'; // Altere para uma senha segura
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hash da senha:', hash);
});
```

Substitua o hash no arquivo `database/seed.sql`.

### 2. Configurar Variáveis de Ambiente do Backend

No seu backend, configure:

```env
DATABASE_URL=sua_connection_string_do_supabase
JWT_SECRET=sua_chave_secreta_jwt
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_do_mercado_pago
PORT=3000
```

### 3. Endpoints do Backend

Certifique-se de que seu backend implementa todos os endpoints listados no README.md.

## 💳 Configuração do Mercado Pago

### 1. Criar Conta e Obter Credenciais

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Obtenha suas credenciais:
   - Public Key (para o frontend)
   - Access Token (para o backend)

### 2. Configurar Webhooks

Configure um webhook no Mercado Pago para receber notificações de pagamento:

```
URL: https://seu-backend.com/api/webhooks/mercadopago
Eventos: payment.created, payment.updated
```

## ⚙️ Configuração do Frontend

### 1. Instalar Dependências

```bash
cd eventos
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp env.example .env
```

Edite o arquivo `.env`:

```env
# URL do seu backend
VITE_API_URL=http://localhost:3000/api

# Credenciais do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Chave pública do Mercado Pago
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_public_key
```

### 3. Iniciar Aplicação

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🧪 Testando o Sistema

### 1. Testar Frontend

1. Acesse `http://localhost:5173`
2. Navegue pela página inicial
3. Tente fazer uma inscrição
4. Faça login com as credenciais do administrador
5. Acesse o painel administrativo

### 2. Credenciais de Teste

**Administrador:**
- Email: admin@igreja.com
- Senha: admin123 (ou a que você configurou)

## 🚀 Deploy em Produção

### Frontend (Vercel/Netlify)

1. Faça build da aplicação:
```bash
npm run build
```

2. Configure as variáveis de ambiente na plataforma
3. Faça deploy da pasta `dist`

### Backend (Heroku/Railway/AWS)

1. Configure as variáveis de ambiente
2. Faça deploy do backend Node.js
3. Atualize a variável `VITE_API_URL` no frontend

### Supabase

O Supabase já está em produção por padrão.

## 🔒 Segurança em Produção

Antes de colocar em produção:

1. ✅ Altere todas as senhas padrão
2. ✅ Use senhas fortes e únicas
3. ✅ Configure HTTPS em todos os endpoints
4. ✅ Habilite CORS apenas para domínios confiáveis
5. ✅ Configure rate limiting no backend
6. ✅ Habilite Row Level Security no Supabase
7. ✅ Configure logs e monitoramento
8. ✅ Faça backup regular do banco de dados

## 📞 Suporte

Para dúvidas durante a configuração:

1. Consulte a documentação oficial:
   - [Supabase Docs](https://supabase.com/docs)
   - [Mercado Pago Docs](https://www.mercadopago.com.br/developers)
   - [Vite Docs](https://vitejs.dev/)

2. Verifique os logs:
   - Frontend: Console do navegador
   - Backend: Logs do servidor
   - Banco: Logs do Supabase

## ✅ Checklist de Configuração

- [ ] Node.js instalado
- [ ] Projeto criado no Supabase
- [ ] Tabelas criadas no banco de dados
- [ ] Usuário administrador criado
- [ ] Backend configurado e rodando
- [ ] Conta no Mercado Pago criada
- [ ] Credenciais do Mercado Pago obtidas
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Aplicação frontend iniciada
- [ ] Login administrativo testado
- [ ] Criação de inscrição testada
- [ ] Painel administrativo testado

---

Após completar todos os passos, seu sistema estará pronto para uso! 🎉
