// Serviço para busca de CEP usando a API ViaCEP
export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const searchCep = async (cep: string): Promise<CepData | null> => {
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '');

  // Valida se tem 8 dígitos
  if (cleanCep.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos');
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data: CepData = await response.json();

    // ViaCEP retorna erro quando não encontra o CEP
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return data;
  } catch (error: any) {
    if (error.message === 'CEP não encontrado' || error.message === 'CEP deve conter 8 dígitos') {
      throw error;
    }
    throw new Error('Erro ao buscar CEP. Tente novamente.');
  }
};

// Formata CEP para exibição (00000-000)
export const formatCep = (cep: string): string => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length <= 5) {
    return cleanCep;
  }
  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
};
