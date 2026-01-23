import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('🔄 Iniciando sistema de migrations...\n');

  try {
    // 1. Criar tabela de controle de migrations se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela de controle de migrations verificada\n');

    // 2. Buscar migrations já executadas
    const executedResult = await pool.query(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedMigrations = new Set(executedResult.rows.map(row => row.name));

    // 3. Ler arquivos de migration
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📋 Migrations disponíveis: ${migrationFiles.length}`);
    console.log(`✅ Migrations já executadas: ${executedMigrations.size}\n`);

    // 4. Executar migrations pendentes
    let newMigrationsCount = 0;
    for (const file of migrationFiles) {
      if (!executedMigrations.has(file)) {
        console.log(`🔄 Executando migration: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        await pool.query(sql);
        
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        
        console.log(`✅ Migration executada: ${file}\n`);
        newMigrationsCount++;
      }
    }

    if (newMigrationsCount === 0) {
      console.log('ℹ️  Todas as migrations já foram executadas\n');
    } else {
      console.log(`🎉 ${newMigrationsCount} nova(s) migration(s) executada(s) com sucesso!\n`);
    }

    console.log('🎉 Migrations concluídas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  }
}

migrate();
