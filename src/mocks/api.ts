import type { Event, Registration, PaymentData, EventSettings } from '../types';
import { 
  mockEvents, 
  mockRegistrations, 
  mockAdmin, 
  mockToken,
  mockDelay,
  mockEventSettings 
} from './data';

// Chaves do localStorage
const STORAGE_KEYS = {
  EVENTS: 'mock_events',
  EVENT_SETTINGS: 'mock_event_settings',
  REGISTRATIONS: 'mock_registrations',
};

// Funções auxiliares para localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Erro ao carregar ${key} do localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
  }
};

// Storage local para dados durante a sessão (com persistência)
let registrations = loadFromStorage<Registration[]>(STORAGE_KEYS.REGISTRATIONS, [...mockRegistrations]);
let nextRegId = registrations.length + 1;
let events = loadFromStorage<Event[]>(STORAGE_KEYS.EVENTS, [...mockEvents]);
let eventSettings = loadFromStorage<EventSettings>(STORAGE_KEYS.EVENT_SETTINGS, { ...mockEventSettings });

// Mock API - Simula todas as operações do backend
export const mockApi = {
  // Eventos
  getEvent: async (eventId: string): Promise<Event> => {
    await mockDelay();
    const event = events.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Evento não encontrado');
    }
    return event;
  },

  getEvents: async (): Promise<Event[]> => {
    await mockDelay();
    return events;
  },

  getEventStats: async (eventId: string): Promise<any> => {
    await mockDelay();
    const eventRegs = registrations.filter(r => r.event_id === eventId);
    const approved = eventRegs.filter(r => r.payment_status === 'approved').length;
    const event = events.find(e => e.id === eventId);
    const maxParticipants = event?.max_participants || 0;
    
    return {
      event_id: eventId,
      total_registrations: eventRegs.length,
      approved_registrations: approved,
      max_participants: maxParticipants,
      available_spots: maxParticipants > 0 ? maxParticipants - approved : null,
      percentage_filled: maxParticipants > 0 ? Math.round((approved / maxParticipants) * 100) : 0,
      is_full: maxParticipants > 0 && approved >= maxParticipants
    };
  },

  updateEvent: async (eventId: string, data: Partial<Event>): Promise<Event> => {
    await mockDelay();
    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) {
      throw new Error('Evento não encontrado');
    }
    events[index] = { ...events[index], ...data };
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    console.log('✅ [MOCK] Evento atualizado:', events[index]);
    return events[index];
  },

  // Configurações do Evento
  getEventSettings: async (eventId: string): Promise<EventSettings> => {
    await mockDelay();
    if (eventSettings.event_id !== eventId) {
      throw new Error('Configurações não encontradas');
    }
    return eventSettings;
  },

  updateEventSettings: async (eventId: string, settings: Partial<EventSettings>): Promise<EventSettings> => {
    await mockDelay();
    if (eventSettings.event_id !== eventId) {
      throw new Error('Configurações não encontradas');
    }
    eventSettings = { ...eventSettings, ...settings };
    saveToStorage(STORAGE_KEYS.EVENT_SETTINGS, eventSettings);
    console.log('✅ [MOCK] Configurações atualizadas:', eventSettings);
    return eventSettings;
  },

  // Inscrições
  createRegistration: async (registration: Omit<Registration, 'id' | 'created_at' | 'checked_in' | 'payment_status'>): Promise<Registration> => {
    await mockDelay(800);
    
    const newRegistration: Registration = {
      ...registration,
      id: `reg-${nextRegId++}`,
      payment_status: 'pending',
      checked_in: false,
      created_at: new Date().toISOString(),
    };
    
    registrations.push(newRegistration);
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    console.log('✅ [MOCK] Inscrição criada:', newRegistration);
    
    return newRegistration;
  },

  getRegistrations: async (eventId?: string): Promise<Registration[]> => {
    await mockDelay();
    
    if (eventId) {
      return registrations.filter(r => r.event_id === eventId);
    }
    
    return registrations;
  },

  getRegistrationsByCpf: async (cpf: string): Promise<Registration[]> => {
    await mockDelay();
    
    // Normaliza o CPF removendo formatação para comparação
    const normalizedCpf = cpf.replace(/\D/g, '');
    
    // Retorna apenas inscrições aprovadas com o CPF informado (com ou sem formatação)
    return registrations.filter(r => {
      const regCpfNormalized = r.cpf.replace(/\D/g, '');
      return regCpfNormalized === normalizedCpf && r.payment_status === 'approved';
    });
  },

  getPendingRegistrationByEmail: async (email: string, eventId: string): Promise<Registration | null> => {
    await mockDelay();
    
    // Busca inscrição pendente por email e evento
    const registration = registrations.find(
      r => r.email.toLowerCase() === email.toLowerCase() && 
           r.event_id === eventId && 
           r.payment_status === 'pending'
    );
    
    return registration || null;
  },

  updateRegistration: async (id: string, data: Partial<Registration>): Promise<Registration> => {
    await mockDelay();
    
    const index = registrations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Inscrição não encontrada');
    }
    
    registrations[index] = { ...registrations[index], ...data };
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    console.log('✅ [MOCK] Inscrição atualizada:', registrations[index]);
    
    return registrations[index];
  },

  deleteRegistration: async (id: string): Promise<void> => {
    await mockDelay();
    
    const index = registrations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Inscrição não encontrada');
    }
    
    const deleted = registrations.splice(index, 1)[0];
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    console.log('🗑️ [MOCK] Inscrição excluída:', deleted);
  },

  checkIn: async (id: string): Promise<Registration> => {
    await mockDelay();
    
    const index = registrations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Inscrição não encontrada');
    }
    
    // Toggle check-in
    const wasCheckedIn = registrations[index].checked_in;
    registrations[index].checked_in = !wasCheckedIn;
    
    // Se está marcando check-in, salvar data. Se desmarcando, remover data.
    if (registrations[index].checked_in && !wasCheckedIn) {
      registrations[index].checked_in_date = new Date().toISOString();
    } else if (!registrations[index].checked_in && wasCheckedIn) {
      registrations[index].checked_in_date = undefined;
    }
    
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    
    const status = registrations[index].checked_in ? '✅ marcado' : '↩️ desmarcado';
    console.log(`[MOCK] Check-in ${status}:`, registrations[index]);
    
    return registrations[index];
  },

  // Pagamento
  createPayment: async (paymentData: any): Promise<any> => {
    await mockDelay(1200);
    
    const payment = {
      id: `pay-mock-${Date.now()}`,
      status: 'approved', // Simula pagamento aprovado
      status_detail: 'accredited',
      transaction_amount: paymentData.transaction_amount,
      description: paymentData.description,
      payment_method_id: paymentData.payment_method_id,
      payer: paymentData.payer,
      date_created: new Date().toISOString(),
      // Dados específicos para PIX
      point_of_interaction: {
        transaction_data: {
          qr_code: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          qr_code_base64: '00020101021126580014br.gov.bcb.pix0136123e4567-e12b-12d3-a456-426655440000'
        }
      }
    };
    
    // Atualizar a inscrição com informações de pagamento
    if (paymentData.registration_id) {
      const index = registrations.findIndex(r => r.id === paymentData.registration_id);
      if (index !== -1) {
        registrations[index] = {
          ...registrations[index],
          payment_status: 'approved',
          payment_id: payment.id,
          payment_method: paymentData.payment_method_id,
          payment_amount: paymentData.transaction_amount,
          payment_date: new Date().toISOString(),
        };
        saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
        console.log('✅ [MOCK] Inscrição atualizada com dados de pagamento');
      }
    }
    
    console.log('✅ [MOCK] Pagamento criado:', payment);
    
    return payment;
  },

  getPaymentStatus: async (paymentId: string): Promise<any> => {
    await mockDelay();
    
    return {
      id: paymentId,
      status: 'approved',
      status_detail: 'accredited',
    };
  },

  getInstallments: async (amount: number, paymentMethodId: string = 'credit_card'): Promise<any> => {
    await mockDelay();
    
    // Simular resposta do Mercado Pago com todas as opções de 1 a 12
    const payerCosts = [];
    
    for (let installments = 1; installments <= 12; installments++) {
      // Simular taxas: 1x sem juros, 2-3x com juros baixos, 4-6x com juros médios, 7-12x com juros altos
      let interestRate = 0;
      if (installments === 1) {
        interestRate = 0;
      } else if (installments <= 3) {
        interestRate = 0.0199; // 1.99% ao mês
      } else if (installments <= 6) {
        interestRate = 0.0299; // 2.99% ao mês
      } else {
        interestRate = 0.0399; // 3.99% ao mês
      }
      
      // Calcular valor da parcela com juros (se houver)
      let installmentAmount: number;
      let totalAmount: number;
      
      if (interestRate === 0) {
        // Sem juros: apenas divide
        const totalInCents = Math.round(amount * 100);
        const baseValueInCents = Math.floor(totalInCents / installments);
        const remainder = totalInCents % installments;
        
        const installmentsArray = Array(installments).fill(baseValueInCents);
        for (let i = 0; i < remainder; i++) {
          installmentsArray[i] += 1;
        }
        
        installmentAmount = installmentsArray[0] / 100;
        totalAmount = installmentsArray.reduce((sum, val) => sum + val, 0) / 100;
      } else {
        // Com juros: cálculo de juros compostos
        const monthlyRate = interestRate;
        installmentAmount = amount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / (Math.pow(1 + monthlyRate, installments) - 1);
        totalAmount = installmentAmount * installments;
      }
      
      payerCosts.push({
        installments,
        installment_rate: interestRate,
        discount_rate: 0,
        reimbursement_rate: null,
        labels: installments === 1 ? ['CFT_0%', 'TEA_0%'] : [],
        installment_rate_collector: [],
        min_allowed_amount: 0,
        max_allowed_amount: 1000000,
        recommended_message: installments === 1 ? 'Pagamento sem juros' : `Parcelado em ${installments}x`,
        installment_amount: Math.round(installmentAmount * 100) / 100,
        total_amount: Math.round(totalAmount * 100) / 100,
      });
    }
    
    return {
      payment_method_id: paymentMethodId,
      payment_type_id: 'credit_card',
      issuer: {
        id: 'null',
        name: 'Simulado',
      },
      payer_costs: payerCosts,
    };
  },

  // Autenticação
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    await mockDelay(800);
    
    // Credenciais de teste
    if (email === 'admin@igreja.com' && password === 'admin123') {
      console.log('✅ [MOCK] Login bem-sucedido');
      return {
        token: mockToken,
        user: mockAdmin,
      };
    }
    
    console.log('❌ [MOCK] Login falhou');
    throw new Error('Credenciais inválidas');
  },

  verifyToken: async (): Promise<any> => {
    await mockDelay();
    
    const token = localStorage.getItem('token');
    if (token === mockToken) {
      console.log('✅ [MOCK] Token válido');
      return { user: mockAdmin }; // Retornar no mesmo formato do backend
    }
    
    console.log('❌ [MOCK] Token inválido');
    throw new Error('Token inválido');
  },
};

// Função auxiliar para resetar dados mockados
export const resetMockData = () => {
  registrations = [...mockRegistrations];
  nextRegId = mockRegistrations.length + 1;
  events = [...mockEvents];
  eventSettings = { ...mockEventSettings };
  
  // Limpa o localStorage
  localStorage.removeItem(STORAGE_KEYS.REGISTRATIONS);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
  localStorage.removeItem(STORAGE_KEYS.EVENT_SETTINGS);
  
  console.log('🔄 [MOCK] Dados resetados');
};
