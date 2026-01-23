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

// Função para buscar opções de parcelamento do Mercado Pago
export const getInstallments = async (amount: number, paymentMethodId: string = 'credit_card') => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken || accessToken === 'TEST-ACCESS-TOKEN') {
    // Retornar parcelamento simulado sem juros - todas as opções de 1 a 12
    const payerCosts = [];
    
    for (let installments = 1; installments <= 12; installments++) {
      // Calcular valor exato sem juros
      const totalInCents = Math.round(amount * 100);
      const baseValueInCents = Math.floor(totalInCents / installments);
      const remainder = totalInCents % installments;
      
      const installmentsArray = Array(installments).fill(baseValueInCents);
      for (let i = 0; i < remainder; i++) {
        installmentsArray[i] += 1;
      }
      
      const installmentAmount = installmentsArray[0] / 100;
      const totalAmount = installmentsArray.reduce((sum, val) => sum + val, 0) / 100;
      
      payerCosts.push({
        installments,
        installment_rate: 0,
        discount_rate: 0,
        reimbursement_rate: null,
        labels: installments === 1 ? ['CFT_0%', 'TEA_0%'] : [],
        installment_rate_collector: [],
        min_allowed_amount: 0,
        max_allowed_amount: 1000000,
        recommended_message: installments === 1 ? 'Pagamento sem juros' : 'Pagamento parcelado',
        installment_amount: installmentAmount,
        total_amount: totalAmount,
      });
    }
    
    return {
      payment_method_id: paymentMethodId,
      payment_type_id: 'credit_card',
      issuer: {
        id: 'null',
        name: 'Simulado',
      },
      payer_costs: payerCosts,
    };
  }

  try {
    // Buscar opções de parcelamento via API REST do Mercado Pago
    const url = new URL('https://api.mercadopago.com/v1/payment_methods/installments');
    url.searchParams.append('amount', amount.toString());
    url.searchParams.append('payment_method_id', paymentMethodId);
    url.searchParams.append('locale', 'pt-BR');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago API error: ${response.status}`);
    }

    const data = await response.json();

    // Retornar a primeira opção (geralmente a mais comum)
    return data[0] || null;
  } catch (error: any) {
    console.error('Erro ao buscar parcelamento do Mercado Pago:', error.message);
    
    // Em caso de erro, retornar parcelamento simulado - todas as opções de 1 a 12
    const payerCosts = [];
    
    for (let installments = 1; installments <= 12; installments++) {
      // Calcular valor exato sem juros
      const totalInCents = Math.round(amount * 100);
      const baseValueInCents = Math.floor(totalInCents / installments);
      const remainder = totalInCents % installments;
      
      const installmentsArray = Array(installments).fill(baseValueInCents);
      for (let i = 0; i < remainder; i++) {
        installmentsArray[i] += 1;
      }
      
      const installmentAmount = installmentsArray[0] / 100;
      const totalAmount = installmentsArray.reduce((sum, val) => sum + val, 0) / 100;
      
      payerCosts.push({
        installments,
        installment_rate: 0,
        discount_rate: 0,
        reimbursement_rate: null,
        labels: installments === 1 ? ['CFT_0%', 'TEA_0%'] : [],
        installment_rate_collector: [],
        min_allowed_amount: 0,
        max_allowed_amount: 1000000,
        recommended_message: installments === 1 ? 'Pagamento sem juros' : 'Pagamento parcelado',
        installment_amount: installmentAmount,
        total_amount: totalAmount,
      });
    }
    
    return {
      payment_method_id: paymentMethodId,
      payment_type_id: 'credit_card',
      issuer: {
        id: 'null',
        name: 'Simulado',
      },
      payer_costs: payerCosts,
    };
  }
};
