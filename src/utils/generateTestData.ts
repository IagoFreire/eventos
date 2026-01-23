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

// Função para gerar endereço aleatório
export const generateRandomAddress = (): string => {
  const streets = [
    'Rua das Flores', 'Avenida Principal', 'Rua do Comércio', 'Avenida Central',
    'Rua da Paz', 'Avenida dos Trabalhadores', 'Rua São Paulo', 'Avenida Brasil',
    'Rua das Palmeiras', 'Avenida da Liberdade', 'Rua do Sol', 'Avenida Paulista'
  ];
  
  const neighborhoods = [
    'Centro', 'Jardim das Flores', 'Vila Nova', 'Bela Vista', 'Copacabana',
    'Ipanema', 'Barra da Tijuca', 'Moema', 'Vila Madalena', 'Pinheiros'
  ];
  
  const cities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
    'Brasília', 'Salvador', 'Recife', 'Fortaleza', 'Manaus'
  ];
  
  const states = ['SP', 'RJ', 'MG', 'PR', 'RS', 'DF', 'BA', 'PE', 'CE', 'AM'];
  
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(1 + Math.random() * 9999);
  const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  
  return `${street}, ${number}, ${neighborhood}, ${city} - ${state}`;
};

// CEPs válidos conhecidos para teste
const validCeps = [
  '01310-100', // Avenida Paulista, São Paulo - SP
  '20040-020', // Praça Mauá, Rio de Janeiro - RJ
  '30130-010', // Praça Sete, Belo Horizonte - MG
  '80020-310', // Rua XV de Novembro, Curitiba - PR
  '90010-150', // Praça da Matriz, Porto Alegre - RS
  '70040-020', // Esplanada dos Ministérios, Brasília - DF
  '40020-000', // Pelourinho, Salvador - BA
  '50010-000', // Recife Antigo, Recife - PE
  '60060-100', // Centro, Fortaleza - CE
  '69020-000', // Centro, Manaus - AM
];

// Função para gerar CEP válido aleatório
export const generateRandomCep = (): string => {
  return validCeps[Math.floor(Math.random() * validCeps.length)];
};

// Função principal para gerar todos os dados de teste
export const generateTestData = () => {
  const name = generateRandomName();
  const cpf = generateValidCPF();
  const email = generateRandomEmail(name);
  const phone = generateRandomPhone();
  const address = generateRandomAddress();
  const cep = generateRandomCep();
  
  return {
    name,
    cpf,
    email,
    phone,
    address,
    cep,
  };
};
