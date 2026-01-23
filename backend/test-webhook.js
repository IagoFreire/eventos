/**
 * Script para testar o webhook do Mercado Pago localmente
 * 
 * Uso: node test-webhook.js <payment_id>
 * 
 * Exemplo: node test-webhook.js 1234567890
 */

import http from 'http';

const paymentId = process.argv[2] || '1234567890';

const webhookData = {
  type: 'payment',
  data: {
    id: paymentId
  }
};

const postData = JSON.stringify(webhookData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/payments/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log(`🔔 Enviando webhook de teste para pagamento: ${paymentId}`);

const req = http.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Webhook processado com sucesso!');
    } else {
      console.log('❌ Erro ao processar webhook:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
  console.error('💡 Certifique-se de que o servidor está rodando na porta 3000');
});

req.write(postData);
req.end();
