import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import registrationQuestionRoutes from './routes/registration-question.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://18.206.108.149',
  'https://18.206.108.149',
  'https://igrejacasabetania.com.br',
  'http://igrejacasabetania.com.br',
  'https://www.igrejacasabetania.com.br',
  'http://www.igrejacasabetania.com.br',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) {
      console.log('🌐 Requisição sem origin (mobile/app) - permitindo');
      return callback(null, true);
    }
    
    // Log para debug
    console.log(`🌐 Origin recebido: ${origin}`);
    
    // Verificar se o origin está na lista
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Origin permitido: ${origin}`);
      callback(null, true);
    } else {
      // Verificar se é um subdomínio ou variação do domínio permitido
      const isAllowedDomain = allowedOrigins.some(allowed => {
        try {
          const allowedUrl = new URL(allowed);
          const originUrl = new URL(origin);
          // Permitir mesmo domínio (com ou sem www, http ou https)
          return allowedUrl.hostname.replace(/^www\./, '') === originUrl.hostname.replace(/^www\./, '');
        } catch {
          return false;
        }
      });
      
      if (isAllowedDomain) {
        console.log(`✅ Origin permitido (domínio correspondente): ${origin}`);
        callback(null, true);
      } else {
        console.warn(`⚠️ Origin bloqueado: ${origin}`);
        console.log(`📋 Origins permitidos: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/registration-questions', registrationQuestionRoutes);

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});

export default app;
