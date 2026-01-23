import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Inicializar SDK do Mercado Pago
import './services/mercadopago-config';

// Suprimir erros de tracking do Mercado Pago (bloqueados por AdBlock)
// Esses erros são inofensivos e não afetam o funcionamento dos pagamentos
if (typeof window !== 'undefined') {
  // Interceptar erros de rede relacionados ao tracking
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const errorMsg = args.join(' ');
    // Ignorar erros de tracking do Mercado Pago
    if (errorMsg.includes('tracks') ||
      errorMsg.includes('ERR_BLOCKED_BY_CLIENT') ||
      errorMsg.includes('mercadolibre.com/tracks') ||
      errorMsg.includes('api.mercadolibre.com/tracks')) {
      // Silenciar - é apenas tracking/analytics, não afeta pagamentos
      return;
    }
    originalError.apply(console, args);
  };

  // Interceptar erros não capturados relacionados ao tracking
  window.addEventListener('error', (event) => {
    if (event.message?.includes('tracks') ||
      event.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
      event.filename?.includes('mercadolibre.com/tracks')) {
      event.preventDefault();
      return false;
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
