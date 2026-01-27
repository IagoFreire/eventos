// Função para gerar CPF válido
export const generateValidCPF = (): string => {
  // Gera 9 primeiros dígitos aleatórios
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  digits.push(digit1);

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  digits.push(digit2);

  // Formata CPF
  return `${digits[0]}${digits[1]}${digits[2]}.${digits[3]}${digits[4]}${digits[5]}.${digits[6]}${digits[7]}${digits[8]}-${digits[9]}${digits[10]}`;
};

// Nomes aleatórios
const firstNames = [
  'João', 'Maria', 'José', 'Ana', 'Carlos', 'Fernanda', 'Paulo', 'Juliana',
  'Pedro', 'Mariana', 'Lucas', 'Beatriz', 'Rafael', 'Camila', 'Felipe', 'Isabela',
  'Gabriel', 'Larissa', 'Thiago', 'Amanda', 'Bruno', 'Patricia', 'Ricardo', 'Carolina',
  'Marcos', 'Vanessa', 'André', 'Renata', 'Rodrigo', 'Tatiana', 'Eduardo', 'Priscila'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Ribeiro', 'Carvalho', 'Almeida', 'Martins', 'Costa', 'Monteiro',
  'Cardoso', 'Rocha', 'Dias', 'Mendes', 'Nunes', 'Moreira', 'Freitas', 'Araújo',
  'Barbosa', 'Cavalcanti', 'Cunha', 'Machado', 'Ramos', 'Teixeira', 'Correia', 'Reis'
];

// Função para gerar nome completo aleatório
export const generateRandomName = (): string => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)];
  const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName1} ${lastName2}`;
};

// Função para gerar email aleatório
export const generateRandomEmail = (name: string): string => {
  const cleanName = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^a-z.]/g, '');
  
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com', 'uol.com.br'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomNum = Math.floor(Math.random() * 9999);
  
  return `${cleanName}${randomNum}@${domain}`;
};

// Função para gerar telefone aleatório
export const generateRandomPhone = (): string => {
  const ddd = ['11', '21', '31', '41', '47', '48', '51', '61', '71', '81', '85'];
  const selectedDDD = ddd[Math.floor(Math.random() * ddd.length)];
  const number = Math.floor(100000000 + Math.random() * 900000000);
  const formatted = number.toString().replace(/(\d{5})(\d{4})/, '$1-$2');
  return `(${selectedDDD}) ${formatted}`;
};


// Função principal para gerar todos os dados de teste
export const generateTestData = () => {
  const name = generateRandomName();
  const cpf = generateValidCPF();
  const email = generateRandomEmail(name);
  const phone = generateRandomPhone();
  
  return {
    name,
    cpf,
    email,
    phone,
  };
};
