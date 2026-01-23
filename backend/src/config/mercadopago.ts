import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Mercado Pago (nova sintaxe SDK 2.x)
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN',
  options: {
    timeout: 5000,
  }
});

export const payment = new Payment(client);
export default client;
