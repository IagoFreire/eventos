/**
 * Configuração do SDK React do Mercado Pago
 * Inicializa o SDK com a chave pública configurada no .env
 */
import { initMercadoPago } from '@mercadopago/sdk-react';

// Obter chave pública do ambiente
const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;

// Inicializar SDK se a chave estiver configurada
if (publicKey && publicKey !== 'your_mercado_pago_public_key' && !publicKey.includes('xxxxxxxx')) {
    try {
        initMercadoPago(publicKey, {
            locale: 'pt-BR'
        });
        console.log('✅ Mercado Pago SDK React inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar Mercado Pago SDK:', error);
    }
} else {
    console.warn('⚠️ VITE_MERCADO_PAGO_PUBLIC_KEY não configurada no arquivo .env');
    console.log('💡 Configure a chave pública no arquivo .env: VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-chave-aqui');
}

export { publicKey };
