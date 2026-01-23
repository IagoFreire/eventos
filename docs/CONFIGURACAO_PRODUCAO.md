# 🚀 Configuração para Produção - Mercado Pago

Guia completo para configurar o sistema com credenciais de produção do Mercado Pago.

## ✅ Checklist de Configuração

### 1. Credenciais do Mercado Pago

**Backend (`backend/.env`):**
```env
# Credenciais de PRODUÇÃO (não começam com TEST-)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=sua_chave_secreta_do_webhook

# Ambiente
NODE_ENV=production

# URL do webhook (deve ser HTTPS público)
WEBHOOK_URL=https://eventos.iagofreire.dev/api/payments/webhook
# OU
BACKEND_URL=https://eventos.iagofreire.dev
```

**Frontend (`.env` ou `.env.production`):**
```env
# Chave pública de PRODUÇÃO
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# URL da API
VITE_API_URL=https://eventos.iagofreire.dev/api
```

### 2. Configurar Webhook no Painel do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Selecione sua aplicação
3. Vá em **"Webhooks"** → **"Modo de produção"**
4. Configure:
   - **URL:** `https://eventos.iagofreire.dev/api/payments/webhook`
   - **Eventos:** Marque apenas **"Pagamentos"**
   - **Assinatura secreta:** Copie e adicione no `MERCADOPAGO_WEBHOOK_SECRET`
5. Salve

### 3. Verificar Configurações do Backend

✅ **URL do webhook deve ser HTTPS público**
- ❌ `http://localhost:3000` (não funciona)
- ❌ `http://seu-dominio.com` (deve ser HTTPS)
- ✅ `https://seu-dominio.com/api/payments/webhook`

✅ **NODE_ENV deve ser `production`**
- Isso garante que o webhook valide assinaturas corretamente

✅ **MERCADOPAGO_WEBHOOK_SECRET configurado**
- Necessário para validar que os webhooks são realmente do Mercado Pago

### 4. Testar em Produção

#### Teste 1: Criar Pagamento PIX
1. Acesse sua aplicação em produção
2. Crie uma inscrição
3. Escolha PIX como método de pagamento
4. Verifique se o QR Code é gerado corretamente

#### Teste 2: Verificar Webhook
1. Após criar o pagamento, verifique os logs do backend
2. Deve aparecer: `🔗 URL do webhook configurada: https://...`
3. Deve aparecer: `📡 notification_url configurada para PIX: https://...`

#### Teste 3: Pagamento Real
1. Pague o PIX usando um app de banco real
2. O webhook deve ser chamado automaticamente
3. Verifique os logs:
   - `🔔 Webhook recebido para pagamento: ...`
   - `✅ Status da inscrição ... atualizado para: approved`
4. O frontend deve detectar e confirmar automaticamente

## 🔍 Verificações Importantes

### ✅ O que já está configurado automaticamente:

1. **Detecção de credenciais de produção**
   - Se o token não começar com `TEST-`, usa produção
   - Se `NODE_ENV=production`, valida assinatura do webhook

2. **Validação de URL do webhook**
   - Só envia `notification_url` se for HTTPS público
   - Não envia se for localhost

3. **Webhook em produção**
   - Valida assinatura se `MERCADOPAGO_WEBHOOK_SECRET` estiver configurado
   - Consulta status real no Mercado Pago
   - Atualiza banco de dados corretamente

4. **Polling automático no frontend**
   - Verifica status a cada 5 segundos
   - Detecta quando webhook atualiza o banco
   - Confirma automaticamente quando aprovado

## ⚠️ Pontos de Atenção

### 1. URL do Webhook
- **DEVE** ser HTTPS (não HTTP)
- **DEVE** ser acessível publicamente
- **DEVE** estar configurada no painel do Mercado Pago

### 2. Assinatura do Webhook
- Em produção, o webhook **valida a assinatura**
- Se a assinatura estiver incorreta, o webhook será rejeitado
- Certifique-se de que `MERCADOPAGO_WEBHOOK_SECRET` está correto

### 3. Credenciais
- **NUNCA** exponha o `ACCESS_TOKEN` no frontend
- Use apenas a `PUBLIC_KEY` no frontend
- Mantenha as credenciais seguras no `.env`

### 4. Ambiente
- Configure `NODE_ENV=production` em produção
- Isso ativa validações de segurança adicionais

## 🧪 Testando Antes de Ir para Produção

### Teste com Credenciais de Produção (Sandbox)

1. Use credenciais de produção no `.env`
2. Configure `NODE_ENV=production`
3. Use ngrok para expor o webhook localmente
4. Configure o webhook no painel com a URL do ngrok
5. Teste um pagamento real (mas em ambiente de teste do Mercado Pago)

Isso permite testar o fluxo completo antes de colocar em produção real.

## 📝 Resumo

**Para funcionar em produção, você precisa:**

1. ✅ Credenciais de produção (Access Token e Public Key)
2. ✅ `WEBHOOK_URL` configurado com URL HTTPS pública
3. ✅ Webhook configurado no painel do Mercado Pago
4. ✅ `MERCADOPAGO_WEBHOOK_SECRET` configurado (recomendado)
5. ✅ `NODE_ENV=production` (recomendado)

**Depois disso, está pronto para funcionar!** 🎉

O sistema detecta automaticamente se está em produção e ajusta o comportamento:
- Valida assinaturas do webhook
- Consulta status real no Mercado Pago
- Processa pagamentos reais
