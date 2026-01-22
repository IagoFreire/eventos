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

  checkIn: async (id: string): Promise<Registration> => {
    await mockDelay();
    
    const index = registrations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Inscrição não encontrada');
    }
    
    registrations[index].checked_in = true;
    saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations);
    console.log('✅ [MOCK] Check-in realizado:', registrations[index]);
    
    return registrations[index];
  },

  // Pagamento
  createPayment: async (paymentData: PaymentData): Promise<any> => {
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
      return mockAdmin;
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
