import bcrypt from 'bcryptjs';

async function testHash() {
  console.log('🔐 Testando hash bcrypt...\n');

  const password = 'admin123';
  const hashFromDB = '$2a$10$8tGW6X9rJzEUjXJQqT4lzeNFh.rZPqzQVHXZl3VKqZjKIGPvHbz7K';

  console.log(`Senha: ${password}`);
  console.log(`Hash no banco: ${hashFromDB}\n`);

  // Testar comparação
  console.log('🔍 Testando bcrypt.compare...');
  const isValid = await bcrypt.compare(password, hashFromDB);
  
  console.log(`Resultado: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n`);

  if (!isValid) {
    console.log('🔨 Gerando novo hash para "admin123"...');
    const newHash = await bcrypt.hash(password, 10);
    console.log(`Novo hash: ${newHash}\n`);
    
    console.log('📝 Atualize o seed com este novo hash:');
    console.log(`VALUES ('admin@eventos.com', '${newHash}', 'admin')`);
  }
}

testHash();
