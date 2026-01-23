# Como fazer build para produção

## Passos para build e deploy

1. **Criar arquivo `.env.production` na raiz do projeto** com:
```env
VITE_API_URL=https://eventos.iagofreire.dev/api
```

2. **Fazer o build do frontend:**
```bash
npm run build
```

3. **Garantir que o backend está rodando na porta 3000:**
```bash
cd backend
npm run build
npm start
```

4. **Reiniciar o Nginx** (se necessário):
```bash
# No Windows, reinicie o serviço Nginx ou execute:
nginx -s reload
```

## Configuração do Backend

No arquivo `.env` do backend, configure:
```env
FRONTEND_URL=https://eventos.iagofreire.dev
PORT=3000
```

## Estrutura

- Frontend: `https://eventos.iagofreire.dev/` → Nginx serve arquivos estáticos de `dist/`
- API: `https://eventos.iagofreire.dev/api/` → Nginx faz proxy para `http://localhost:3000/api/`
