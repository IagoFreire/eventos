import { UserModel } from '../src/models/user.model.js';
import pool from '../src/config/database.js';

async function testLogin() {
  console.log('🔐 Testando login...\n');

  try {
    const email = 'admin@eventos.com';
    const password = 'admin123';

    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}\n`);

    // Verificar se o usuário existe
    const userExists = await UserModel.findByEmail(email);
    
    if (!userExists) {
      console.log('❌ Usuário não encontrado no banco!');
      console.log('Execute: npm run seed');
      process.exit(1);
    }

    console.log('✅ Usuário encontrado no banco');
    console.log(`   ID: ${userExists.id}`);
    console.log(`   Email: ${userExists.email}`);
    console.log(`   Role: ${userExists.role}\n`);

    // Testar senha
    console.log('🔑 Testando senha...');
    const user = await UserModel.verifyPassword(email, password);
    
    if (!user) {
      console.log('❌ Senha incorreta!');
      console.log('   Hash no banco:', userExists.password_hash);
      process.exit(1);
    }

    console.log('✅ Senha correta!');
    console.log('🎉 Login funcionando perfeitamente!\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    await pool.end();
    process.exit(1);
  }
}

testLogin();
