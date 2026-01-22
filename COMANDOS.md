# 🚀 Comandos Rápidos

Referência rápida de comandos para o projeto.

## 📦 Instalação e Setup

```bash
# Clonar repositório
git clone [url-do-repositorio]
cd eventos

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp env.example .env

# Editar variáveis de ambiente
# Edite o arquivo .env com suas credenciais
```

## 🛠️ Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento OFFLINE (sem backend)
npm run dev-offline

# Iniciar servidor de desenvolvimento ONLINE (com backend)
npm run dev

# Iniciar em porta específica
npm run dev -- --port 3000

# Limpar cache e reiniciar
rm -rf node_modules package-lock.json
npm install
npm run dev

# Modo offline com porta específica
npm run dev-offline -- --port 3000
```

## 🏗️ Build

```bash
# Build para produção
npm run build

# Preview da build
npm run preview

# Build e preview
npm run build && npm run preview
```

## ✅ Qualidade de Código

```bash
# Executar linter
npm run lint

# Fix automático de problemas de lint
npm run lint -- --fix

# Verificar tipos TypeScript
npx tsc --noEmit
```

## 🗄️ Banco de Dados (Supabase)

### Via Interface Web
1. Acesse https://supabase.com/dashboard
2. Vá em SQL Editor
3. Execute os scripts em ordem:
   - `database/schema.sql`
   - `database/policies.sql`
   - `database/seed.sql`

### Via CLI (Opcional)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link com projeto
supabase link --project-ref seu-projeto-id

# Executar migrations
supabase db push
```

## 🔑 Configurar Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_public_key
```

### Obter credenciais Supabase
```bash
# URL do projeto
1. Dashboard > Settings > API > Project URL

# Anon Key
2. Dashboard > Settings > API > Project API keys > anon public
```

## 🎨 Customização

### Alterar cores
```bash
# Editar: src/index.css
# Procurar por: :root { ... }
# Alterar variáveis CSS
```

### Alterar logo
```bash
# Substituir: public/vite.svg
# Atualizar: src/components/Header.tsx (ícone ✝)
```

## 🚀 Deploy

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy em produção
vercel --prod
```

### Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --dir=dist --prod
```

### GitHub Pages
```bash
# Adicionar ao package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Instalar gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## 🧪 Testes

### Teste manual
```bash
# 1. Inicie o servidor
npm run dev

# 2. Acesse as páginas
# http://localhost:5173/         - Home
# http://localhost:5173/inscricao - Inscrição
# http://localhost:5173/login     - Login
# http://localhost:5173/admin     - Admin
```

### Teste de build
```bash
# 1. Build
npm run build

# 2. Preview
npm run preview

# 3. Teste em http://localhost:4173
```

## 🔍 Debug

### Console do navegador
```bash
# Abrir DevTools: F12
# Ver logs, erros, network
```

### React DevTools
```bash
# Instalar extensão do navegador:
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

### Verificar env
```typescript
// Adicionar em qualquer componente:
console.log('ENV:', import.meta.env);
```

## 📊 Monitoramento

### Ver logs do Vite
```bash
npm run dev -- --debug

# ou
npm run dev -- --logLevel info
```

### Analisar bundle
```bash
# Instalar analyzer
npm install --save-dev rollup-plugin-visualizer

# Build com análise
npm run build

# Ver relatório em: dist/stats.html
```

## 🆘 Problemas Comuns

### Porta em uso
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:5173 | xargs kill
```

### Cache do navegador
```bash
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Ou navegação anônima: Ctrl+Shift+N
```

### Módulos corrompidos
```bash
# Limpar tudo
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install
```

### TypeScript errors
```bash
# Verificar tipos
npx tsc --noEmit

# Reiniciar TypeScript server (VSCode)
# Ctrl+Shift+P > TypeScript: Restart TS Server
```

## 📱 Teste em Dispositivos

### Acessar de outro dispositivo
```bash
# 1. Iniciar com host
npm run dev -- --host

# 2. Acesse de outro dispositivo na mesma rede
# http://[seu-ip]:5173
# Exemplo: http://192.168.1.100:5173
```

### Descobrir seu IP
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
# ou
ip addr show
```

## 🔐 Segurança

### Verificar dependências
```bash
# Audit
npm audit

# Fix vulnerabilidades
npm audit fix

# Fix forçado
npm audit fix --force
```

### Atualizar dependências
```bash
# Ver outdated
npm outdated

# Atualizar todas
npm update

# Atualizar específica
npm install react@latest
```

## 📚 Documentação

### Abrir documentação
```bash
# README
cat README.md

# Setup
cat SETUP.md

# Quick start
cat QUICKSTART.md

# Arquitetura
cat ARCHITECTURE.md
```

### Gerar documentação de código
```bash
# Instalar TypeDoc
npm install --save-dev typedoc

# Gerar docs
npx typedoc src/

# Ver em: docs/index.html
```

## 🎯 Produtividade

### Aliases úteis (adicionar ao .bashrc/.zshrc)
```bash
alias dev="npm run dev"
alias build="npm run build"
alias preview="npm run preview"
```

### VSCode snippets
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true
}
```

## 📞 Ajuda

### Documentação online
- React: https://react.dev
- TypeScript: https://typescriptlang.org
- Vite: https://vitejs.dev
- Supabase: https://supabase.com/docs
- Mercado Pago: https://mercadopago.com.br/developers

### Comunidades
- Stack Overflow
- GitHub Issues
- Discord React Brasil
- Reddit r/reactjs

---

💡 **Dica:** Salve este arquivo nos favoritos para acesso rápido aos comandos!
