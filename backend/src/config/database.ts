import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'eventos',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 5, // Limite menor para Supabase Free (Connection Pooler)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Timeout maior para conexões remotas
  ssl: {
    rejectUnauthorized: false // Necessário para Supabase
  }
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no cliente do banco de dados', err);
  process.exit(-1);
});

export default pool;
