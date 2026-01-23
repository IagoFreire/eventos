import { UserModel } from '../src/models/user.model.js';
import pool from '../src/config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  console.log('🔐 Criar novo usuário administrador\n');

  try {
    const email = await question('Email: ');
    const password = await question('Senha: ');
    const confirmPassword = await question('Confirmar senha: ');

    if (password !== confirmPassword) {
      console.error('❌ As senhas não coincidem!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ A senha deve ter no mínimo 6 caracteres!');
      process.exit(1);
    }

    // Verificar se o email já existe
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      console.error('❌ Este email já está cadastrado!');
      process.exit(1);
    }

    // Criar usuário
    const user = await UserModel.create(email, password, 'admin');
    console.log('\n✅ Usuário administrador criado com sucesso!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 ID: ${user.id}`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
