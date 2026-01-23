# 🧪 Como Testar PIX Localmente

Guia completo para testar pagamentos PIX em ambiente de desenvolvimento local.

## 📋 Opções de Teste

### Opção 1: Simulação Rápida (Mais Fácil) ⚡

**Ideal para:** Testar o fluxo da interface rapidamente

1. **Crie um pagamento PIX normalmente**
   - Preencha o formulário de inscrição
   - Escolha PIX como método de pagamento
   - O QR Code será gerado

2. **Use o botão "Simular Pagamento Aprovado"**
   - Aparece automaticamente quando `isTestMode={true}`
   - Clique no botão verde "✅ Simular Pagamento Aprovado"
   - A inscrição será confirmada imediatamente

**Vantagens:**
- ✅ Rápido e simples
- ✅ Não precisa configurar nada
- ✅ Testa todo o fluxo da interface

**Limitações:**
- ❌ Não testa o webhook real
- ❌ Não testa integração com Mercado Pago

---

### Opção 2: Teste com Webhook Manual 🔧

**Ideal para:** Testar o webhook sem precisar de URL pública

1. **Crie um pagamento PIX**
   - Anote o `payment_id` retornado (aparece no console do backend)

2. **Simule o webhook manualmente**

   **Opção A - Script simples:**
   ```bash
   cd backend
   node test-webhook.js <payment_id>
   ```

   **Opção B - Script detalhado:**
   ```bash
   cd backend
   node test-webhook-detailed.js <payment_id>
   ```

   **Opção C - cURL:**
   ```bash
   curl -X POST http://localhost:3000/api/payments/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "type": "payment",
       "data": {
         "id": "<payment_id>"
       }
     }'
   ```

   **Opção D - Postman:**
   - Método: POST
   - URL: `http://localhost:3000/api/payments/webhook`
   - Body (JSON):
     ```json
     {
       "type": "payment",
       "data": {
         "id": "<payment_id>"
       }
     }
     ```

3. **Verifique os logs do backend**
   - Você verá: `🔔 Webhook recebido para pagamento: <payment_id>`
   - Você verá: `✅ Status da inscrição ... atualizado para: approved`

**Vantagens:**
- ✅ Testa o webhook real
- ✅ Não precisa de URL pública
- ✅ Testa a lógica de atualização de status

**Limitações:**
- ❌ Não testa notificação automática do Mercado Pago
- ❌ Precisa executar manualmente

---

### Opção 3: Teste com ngrok (Mais Realista) 🌐

**Ideal para:** Testar o fluxo completo com notificações reais do Mercado Pago

#### Passo 1: Instalar ngrok

**Windows:**
```bash
# Baixe em https://ngrok.com/download
# Ou use chocolatey:
choco install ngrok

# Ou use npm:
npm install -g ngrok
```

**Linux/Mac:**
```bash
# Via npm:
npm install -g ngrok

# Ou baixe direto do site
```

#### Passo 2: Expor seu backend

```bash
ngrok http 3000
```

Você verá algo como:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

#### Passo 3: Configurar no .env

No arquivo `backend/.env`:
```env
WEBHOOK_URL=https://abc123.ngrok.io/api/payments/webhook
```

**Importante:** Substitua `abc123.ngrok.io` pela URL que o ngrok gerou!

#### Passo 4: Reiniciar o backend

```bash
# Pare o backend (Ctrl+C)
# Inicie novamente:
cd backend
npm run dev
```

#### Passo 5: Configurar no Mercado Pago

1. Acesse o painel do Mercado Pago
2. Vá em "Webhooks" → "Modo de teste"
3. Configure a URL: `https://abc123.ngrok.io/api/payments/webhook`
4. Marque o evento "Pagamentos"
5. Salve

#### Passo 6: Testar

1. **Crie um pagamento PIX de teste**
   - Use credenciais de teste do Mercado Pago
   - O QR Code será gerado

2. **Simule o pagamento no Mercado Pago**
   - No painel do Mercado Pago, vá em "Testes"
   - Use um pagamento de teste
   - O webhook será chamado automaticamente

3. **Monitore os logs**
   - Backend: Verá o webhook sendo recebido
   - ngrok: Verá as requisições no dashboard (http://127.0.0.1:4040)

**Vantagens:**
- ✅ Testa o fluxo completo
- ✅ Testa notificações reais do Mercado Pago
- ✅ Mais próximo do ambiente de produção

**Limitações:**
- ⚠️ Precisa manter o ngrok rodando
- ⚠️ URL muda a cada reinício (plano gratuito)
- ⚠️ Requer credenciais de teste do Mercado Pago

---

### Opção 4: Teste com Pagamento Real (Sandbox) 💳

**Ideal para:** Testar com pagamentos reais em ambiente de teste

1. **Configure credenciais de teste**
   ```env
   # backend/.env
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

2. **Configure webhook com ngrok** (veja Opção 3)

3. **Crie um pagamento PIX**
   - Use dados de teste válidos:
     - CPF: `12345678909`
     - Email: `test_user_123456@testuser.com`

4. **Pague o PIX de teste**
   - O Mercado Pago gera um QR Code real
   - Você pode pagar usando um app de banco de teste
   - O webhook será chamado automaticamente quando o pagamento for processado

**Vantagens:**
- ✅ Testa com pagamento real (mas não debita dinheiro de verdade)
- ✅ Testa todo o fluxo end-to-end

**Limitações:**
- ⚠️ Requer app de banco de teste
- ⚠️ Processo mais demorado

---

## 🔍 Verificando se Funcionou

### 1. Verificar Logs do Backend

Ao criar pagamento:
```
💳 Criando pagamento no Mercado Pago: { ... }
✅ Pagamento criado no Mercado Pago: { payment_id: '...', status: 'pending' }
```

Ao receber webhook:
```
🔔 Webhook recebido para pagamento: <payment_id>
📊 Status do pagamento <payment_id>: approved
✅ Status da inscrição <registration_id> atualizado para: approved
```

### 2. Verificar no Banco de Dados

```sql
SELECT id, payment_status, payment_id 
FROM registrations 
WHERE payment_id = '<payment_id>';
```

O `payment_status` deve estar como `approved`.

### 3. Verificar na Interface

- Acesse a página de confirmação
- O status deve mostrar "Pagamento Aprovado"
- O ingresso deve estar disponível

---

## 🐛 Troubleshooting

### Webhook não está sendo chamado

**Problema:** O Mercado Pago não está enviando notificações

**Soluções:**
1. Verifique se a URL do webhook está correta no painel do Mercado Pago
2. Verifique se o ngrok está rodando e acessível
3. Teste a URL manualmente: `curl https://sua-url.ngrok.io/api/payments/webhook`
4. Verifique os logs do ngrok: http://127.0.0.1:4040

### Erro "notification_url must be url valid"

**Problema:** Tentando usar `http://localhost` como webhook

**Solução:** 
- Não configure `WEBHOOK_URL` no `.env` para desenvolvimento local
- Ou use ngrok para gerar uma URL pública HTTPS

### Pagamento não está sendo atualizado

**Problema:** Webhook recebido mas status não atualiza

**Soluções:**
1. Verifique se o `payment_id` está sendo salvo na inscrição
2. Verifique os logs do backend para erros
3. Teste o webhook manualmente com o script
4. Verifique se a inscrição existe no banco

### ngrok URL muda a cada vez

**Problema:** URL do ngrok muda e precisa reconfigurar

**Solução:**
- Use ngrok com conta gratuita (URL fixa por 2 horas)
- Ou use ngrok com autenticação para URL fixa
- Ou atualize o `.env` e reinicie o backend quando a URL mudar

---

## 📝 Resumo Rápido

**Para teste rápido:**
```bash
# 1. Crie pagamento PIX
# 2. Clique em "Simular Pagamento Aprovado"
✅ Pronto!
```

**Para teste completo:**
```bash
# 1. Instale ngrok: npm install -g ngrok
# 2. Exponha backend: ngrok http 3000
# 3. Configure WEBHOOK_URL no .env
# 4. Configure no painel do Mercado Pago
# 5. Crie pagamento e aguarde webhook
✅ Teste completo!
```

---

## 💡 Dicas

1. **Use o console do navegador** para ver logs do frontend
2. **Use os logs do backend** para ver o processamento
3. **Use o dashboard do ngrok** (http://127.0.0.1:4040) para ver requisições
4. **Mantenha o ngrok rodando** enquanto testa
5. **Use credenciais de teste** do Mercado Pago (começam com `TEST-`)

---

## 🎯 Recomendação

Para desenvolvimento local, recomendo:

1. **Desenvolvimento inicial:** Use Opção 1 (Simulação Rápida)
2. **Teste de webhook:** Use Opção 2 (Webhook Manual)
3. **Teste completo:** Use Opção 3 (ngrok) quando precisar testar integração real

Isso permite testar progressivamente, do mais simples ao mais complexo! 🚀
