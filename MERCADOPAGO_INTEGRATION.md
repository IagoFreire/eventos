# Integração com Mercado Pago

Guia completo para integrar o sistema com a API do Mercado Pago.

## 📋 Pré-requisitos

1. Conta no Mercado Pago
2. Aplicação criada no [Portal de Desenvolvedores](https://www.mercadopago.com.br/developers)
3. Credenciais de teste e produção

## 🔑 Obtendo Credenciais

### 1. Criar Aplicação

1. Acesse https://www.mercadopago.com.br/developers/panel
2. Clique em "Criar aplicação"
3. Escolha "Pagamentos online"
4. Preencha os dados da aplicação

### 2. Obter Credenciais

No painel da sua aplicação, você encontrará:

**Credenciais de Teste:**
- Public Key (começam com `TEST-`)
- Access Token (começam com `TEST-`)

**Credenciais de Produção:**
- Public Key
- Access Token

## ⚙️ Configuração

### Frontend (.env)

```env
# Teste
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Produção
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Backend (.env)

```env
# Teste
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Produção
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🔌 Implementação no Backend

### Instalação do SDK

```bash
npm install mercadopago
```

### Configuração Básica

```javascript
// backend/config/mercadopago.js
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

module.exports = mercadopago;
```

### Endpoint de Pagamento

```javascript
// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');

// Criar pagamento
router.post('/payments', async (req, res) => {
  try {
    const { transaction_amount, description, payment_method_id, payer } = req.body;

    const payment = await mercadopago.payment.create({
      transaction_amount: parseFloat(transaction_amount),
      description: description,
      payment_method_id: payment_method_id,
      payer: {
        email: payer.email,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number,
        },
      },
    });

    // Atualizar inscrição no banco de dados
    await updateRegistrationPaymentStatus(
      req.body.registration_id,
      payment.body.id,
      payment.body.status
    );

    res.json(payment.body);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Consultar status do pagamento
router.get('/payments/:id', async (req, res) => {
  try {
    const payment = await mercadopago.payment.get(req.params.id);
    res.json(payment.body);
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Webhook para Notificações

```javascript
// backend/routes/webhooks.js
const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');

router.post('/webhooks/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    // Confirmar que é uma notificação de pagamento
    if (type === 'payment') {
      const paymentId = data.id;

      // Buscar informações do pagamento
      const payment = await mercadopago.payment.get(paymentId);
      const status = payment.body.status;

      // Atualizar status no banco de dados
      await updatePaymentStatus(paymentId, status);

      // Enviar email de confirmação se aprovado
      if (status === 'approved') {
        await sendConfirmationEmail(payment.body);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;
```

## 💳 Tipos de Pagamento

### 1. PIX

```javascript
const payment = {
  transaction_amount: 350.00,
  description: 'Inscrição - Retiro Espiritual 2026',
  payment_method_id: 'pix',
  payer: {
    email: 'user@email.com',
    identification: {
      type: 'CPF',
      number: '12345678900'
    }
  }
};

// Retorna:
// - payment.point_of_interaction.transaction_data.qr_code (QR Code em base64)
// - payment.point_of_interaction.transaction_data.qr_code_base64 (Texto do QR Code)
```

### 2. Cartão de Crédito

```javascript
const payment = {
  transaction_amount: 350.00,
  token: 'card_token_id', // Obtido pelo frontend
  description: 'Inscrição - Retiro Espiritual 2026',
  installments: 1,
  payment_method_id: 'visa',
  payer: {
    email: 'user@email.com',
    identification: {
      type: 'CPF',
      number: '12345678900'
    }
  }
};
```

### 3. Boleto

```javascript
const payment = {
  transaction_amount: 350.00,
  description: 'Inscrição - Retiro Espiritual 2026',
  payment_method_id: 'bolbradesco',
  payer: {
    email: 'user@email.com',
    first_name: 'João',
    last_name: 'Silva',
    identification: {
      type: 'CPF',
      number: '12345678900'
    },
    address: {
      zip_code: '01234567',
      street_name: 'Rua das Flores',
      street_number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      federal_unit: 'SP'
    }
  }
};

// Retorna:
// - payment.transaction_details.external_resource_url (URL do boleto)
```

## 🎨 Frontend - Exibição do Pagamento

### PIX - Mostrar QR Code

```typescript
// src/pages/Registration.tsx
const handlePixPayment = async () => {
  const payment = await createPayment(paymentData);
  
  if (payment.payment_method_id === 'pix') {
    // Mostrar QR Code
    const qrCodeImage = payment.point_of_interaction.transaction_data.qr_code_base64;
    const qrCodeText = payment.point_of_interaction.transaction_data.qr_code;
    
    // Exibir em modal ou página
    setPixQrCode({ image: qrCodeImage, text: qrCodeText });
  }
};
```

### Cartão de Crédito - Tokenização

Instale o SDK do Mercado Pago no frontend:

```bash
npm install @mercadopago/sdk-js
```

```typescript
// src/services/mercadopago.ts
import { loadMercadoPago } from '@mercadopago/sdk-js';

await loadMercadoPago();
const mp = new window.MercadoPago(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY);

// Criar token do cartão
const cardToken = await mp.fields.createCardToken({
  cardNumber: '4111111111111111',
  cardholderName: 'João Silva',
  identificationType: 'CPF',
  identificationNumber: '12345678900',
  securityCode: '123',
  expirationMonth: '12',
  expirationYear: '2025',
});
```

## 📊 Status de Pagamento

| Status | Descrição | Ação |
|--------|-----------|------|
| `pending` | Pagamento pendente | Aguardar |
| `approved` | Pagamento aprovado | Confirmar inscrição |
| `authorized` | Pagamento autorizado | Aguardar captura |
| `in_process` | Em processamento | Aguardar |
| `in_mediation` | Em disputa | Verificar |
| `rejected` | Rejeitado | Tentar novamente |
| `cancelled` | Cancelado | Criar novo |
| `refunded` | Reembolsado | Cancelar inscrição |
| `charged_back` | Estornado | Cancelar inscrição |

## 🔔 Configurar Webhooks

### 1. No Painel do Mercado Pago

1. Acesse "Webhooks" no painel
2. Clique em "Configurar Webhooks"
3. Adicione a URL: `https://seu-backend.com/api/webhooks/mercadopago`
4. Selecione os eventos:
   - `payment.created`
   - `payment.updated`

### 2. Validar Webhook (Recomendado)

```javascript
const crypto = require('crypto');

function validateWebhook(req) {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  const dataID = req.query['data.id'];
  
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  
  const parts = xSignature.split(',');
  const ts = parts[0].split('=')[1];
  const hash = parts[1].split('=')[1];
  
  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const sha = hmac.digest('hex');
  
  return sha === hash;
}
```

## 🧪 Testes

### Cartões de Teste

| Cartão | Resultado |
|--------|-----------|
| 5031 4332 1540 6351 | Aprovado |
| 5031 7557 3453 0604 | Recusado |
| 4235 6477 2802 5682 | Pendente |

**Dados de teste:**
- CVV: Qualquer 3 dígitos
- Validade: Qualquer data futura
- Nome: Qualquer nome

### CPF de Teste

```
12345678909 (aprovado)
```

### Emails de Teste

```
test_user_123456@testuser.com
```

## 📧 Notificações por Email

Após pagamento aprovado, envie email de confirmação:

```javascript
const nodemailer = require('nodemailer');

async function sendConfirmationEmail(payment) {
  const transporter = nodemailer.createTransport({
    // Configuração SMTP
  });

  await transporter.sendMail({
    from: 'contato@igreja.com',
    to: payment.payer.email,
    subject: 'Pagamento Confirmado - Retiro Espiritual',
    html: `
      <h1>Pagamento Confirmado!</h1>
      <p>Seu pagamento foi aprovado com sucesso.</p>
      <p>ID do Pagamento: ${payment.id}</p>
      <p>Valor: R$ ${payment.transaction_amount}</p>
    `
  });
}
```

## 🛡️ Segurança

### Boas Práticas

1. ✅ **Nunca exponha** o Access Token no frontend
2. ✅ **Use HTTPS** em produção
3. ✅ **Valide webhooks** com assinatura
4. ✅ **Armazene credenciais** em variáveis de ambiente
5. ✅ **Implemente rate limiting**
6. ✅ **Registre todas as transações**
7. ✅ **Monitore fraudes**

## 📚 Referências

- [Documentação Oficial](https://www.mercadopago.com.br/developers/pt/docs)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [SDK JavaScript](https://github.com/mercadopago/sdk-js)
- [Cartões de Teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)

## 🆘 Suporte

- [Central de Ajuda](https://www.mercadopago.com.br/ajuda)
- [Comunidade](https://www.mercadopago.com.br/developers/pt/community)
- Email: developers@mercadopago.com

---

Com esta integração, seu sistema estará pronto para processar pagamentos de forma segura e profissional! 💰
