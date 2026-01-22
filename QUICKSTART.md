# Guia Rápido de Início

Comece a usar o sistema em 5 minutos!

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_public_key
```

### 3. Iniciar Servidor de Desenvolvimento

#### Modo Offline (Recomendado para começar)
```bash
npm run dev-offline
```

#### Modo Online (Requer backend configurado)
```bash
npm run dev
```

Acesse: http://localhost:5173

**Login modo offline:**
- Email: `admin@igreja.com`
- Senha: `admin123`

## 🎯 Testando o Sistema

### Modo Offline (Sem Backend) ⚡

Use o comando especial para modo offline:

```bash
npm run dev-offline
```

O sistema funcionará **100% completo** com dados mockados!

**Você pode:**
- ✅ Ver a página inicial com eventos
- ✅ Fazer inscrições (salvam em memória)
- ✅ Fazer login (admin@igreja.com / admin123)
- ✅ Acessar painel administrativo completo
- ✅ Ver estatísticas, editar, fazer check-in
- ✅ Simular pagamentos

**Limitações:**
- ❌ Dados não persistem após recarregar
- ❌ Pagamentos são simulados

### Com Backend

Certifique-se de que o backend está rodando em `http://localhost:3000` e tem os seguintes endpoints:

```
GET  /api/events
POST /api/registrations
POST /api/auth/login
GET  /api/registrations (requer auth)
```

## 📁 Estrutura Mínima

```
eventos/
├── src/
│   ├── pages/          # 4 páginas principais
│   ├── contexts/       # 3 contexts para estado
│   ├── components/     # Componentes reutilizáveis
│   └── services/       # Integração API
├── database/           # Scripts SQL
├── .env               # Suas credenciais (criar)
└── package.json
```

## 🎨 Páginas Disponíveis

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/` | Página inicial do evento | Não |
| `/inscricao` | Formulário de inscrição | Não |
| `/login` | Login administrativo | Não |
| `/admin` | Painel de administração | Sim |

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento OFFLINE (recomendado para começar)
npm run dev-offline

# Desenvolvimento online (requer backend)
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

## ⚙️ Próximos Passos

1. ✅ Sistema frontend funcionando
2. ⬜ Configurar banco de dados (ver `SETUP.md`)
3. ⬜ Conectar backend
4. ⬜ Configurar Mercado Pago
5. ⬜ Testar fluxo completo
6. ⬜ Deploy em produção

## 🆘 Problemas Comuns

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 5173 already in use"
```bash
# Mude a porta no vite.config.ts ou
# Feche a aplicação que está usando a porta
```

### Erro: "CORS policy"
```bash
# Configure o backend para aceitar requisições do frontend
# Adicione no backend:
# app.use(cors({ origin: 'http://localhost:5173' }))
```

## 📚 Documentação Completa

- `README.md` - Visão geral e funcionalidades
- `SETUP.md` - Configuração completa passo a passo
- `ARCHITECTURE.md` - Arquitetura e estrutura técnica

## 💡 Dicas

1. **Use os dados mockados** enquanto o backend não está pronto
2. **Abra o console do navegador** para ver logs úteis
3. **Instale a extensão React DevTools** para debug
4. **Use o ESLint** para manter o código limpo

## 🎉 Pronto!

Agora você já pode:
- 👀 Visualizar o sistema funcionando
- 🎨 Customizar cores e estilos
- 📝 Adicionar mais funcionalidades
- 🚀 Preparar para produção

---

Dúvidas? Consulte a documentação completa ou entre em contato com a equipe.
