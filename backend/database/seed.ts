import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // Ler arquivos de seed
    const seedsDir = path.join(__dirname, 'seeds');
    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📋 Seeds disponíveis: ${seedFiles.length}\n`);

    // Executar seeds
    for (const file of seedFiles) {
      console.log(`🌱 Executando seed: ${file}`);
      
      const seedPath = path.join(seedsDir, file);
      const sql = fs.readFileSync(seedPath, 'utf8');
      
      await pool.query(sql);
      
      console.log(`✅ Seed executado: ${file}\n`);
    }

    console.log('🎉 Seeds executados com sucesso!');
    
    // Mostrar informações úteis
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
    
    console.log('\n📊 Resumo do banco:');
    console.log(`   Usuários: ${usersCount.rows[0].count}`);
    console.log(`   Eventos: ${eventsCount.rows[0].count}`);
    console.log('\n🔐 Login padrão:');
    console.log('   Email: admin@eventos.com');
    console.log('   Senha: admin123');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    process.exit(1);
  }
}

seed();
