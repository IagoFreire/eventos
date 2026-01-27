import axios from 'axios';
import type { Event, Registration, PaymentData, EventSettings, EventDate, RegistrationQuestion, RegistrationAnswer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instância do axios sem interceptor para rotas públicas
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Eventos
export const getEvent = async (eventId: string): Promise<Event> => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

export const getEvents = async (): Promise<Event[]> => {
  const response = await api.get('/events');
  return response.data;
};

export const getEventStats = async (eventId: string): Promise<any> => {
  const response = await api.get(`/events/${eventId}/stats`);
  return response.data;
};

export const updateEvent = async (eventId: string, data: Partial<Event>): Promise<Event> => {
  const response = await api.put(`/events/${eventId}`, data);
  return response.data;
};

// Configurações do Evento
export const getEventSettings = async (eventId: string): Promise<EventSettings> => {
  const response = await api.get(`/events/${eventId}/settings`);
  return response.data;
};

export const updateEventSettings = async (eventId: string, settings: Partial<EventSettings>): Promise<EventSettings> => {
  const response = await api.put(`/events/${eventId}/settings`, settings);
  return response.data;
};

// Datas do Evento
export const getEventDates = async (eventId: string): Promise<EventDate[]> => {
  const response = await api.get(`/events/${eventId}/dates`);
  return response.data;
};

export const updateEventDates = async (eventId: string, dates: (string | Date)[]): Promise<EventDate[]> => {
  const response = await api.put(`/events/${eventId}/dates`, { dates });
  return response.data;
};

// Inscrições
export const createRegistration = async (
  registration: Omit<Registration, 'id' | 'created_at' | 'checked_in' | 'payment_status'>,
  answers?: Omit<RegistrationAnswer, 'id' | 'registration_id' | 'created_at' | 'updated_at'>[]
): Promise<Registration> => {
  const response = await api.post('/registrations', {
    ...registration,
    answers: answers || []
  });
  return response.data;
};

export const getRegistrations = async (eventId?: string): Promise<Registration[]> => {
  const response = await api.get('/registrations', {
    params: { event_id: eventId }
  });
  return response.data;
};

export const getRegistrationById = async (id: string): Promise<Registration> => {
  const response = await api.get(`/registrations/${id}`);
  return response.data;
};

// Verificar status de pagamento (rota pública - usado pelo botão "Já Paguei")
export const checkPaymentStatus = async (id: string): Promise<Registration> => {
  const response = await api.get(`/registrations/${id}/check-payment`);
  return response.data;
};

// Simular pagamento (hardcoded - apenas para desenvolvimento/teste)
export const simulatePayment = async (id: string, amount?: number): Promise<Registration> => {
  // Usar instância pública do axios (sem interceptor de token)
  const response = await publicApi.post(`/registrations/${id}/simulate-payment`, {
    amount: amount
  });
  return response.data;
};

export const updateRegistration = async (id: string, data: Partial<Registration>): Promise<Registration> => {
  // Se for atualizar APENAS o método de pagamento selecionado (sem outros campos), usar rota pública
  const hasPaymentMethod = 'payment_method' in data || 'selected_payment_method' in data;
  const hasOtherFields = Object.keys(data).some(key => 
    key !== 'payment_method' && 
    key !== 'selected_payment_method' &&
    key !== 'id' &&
    key !== 'created_at' &&
    key !== 'updated_at'
  );
  
  // Se tiver apenas método de pagamento e nenhum outro campo, usar rota pública
  if (hasPaymentMethod && !hasOtherFields) {
    const paymentMethod = data.selected_payment_method || data.payment_method;
    
    if (paymentMethod === null || paymentMethod === undefined) {
      throw new Error('Método de pagamento não pode ser null ou undefined');
    }
    
    const response = await api.patch(`/registrations/${id}/payment-method`, { 
      payment_method: paymentMethod 
    });
    return response.data;
  }
  
  // Caso contrário, usar rota protegida (admin) - permite atualizar qualquer campo, incluindo payment_status
  const response = await api.put(`/registrations/${id}`, data);
  return response.data;
};

export const deleteRegistration = async (id: string): Promise<void> => {
  await api.delete(`/registrations/${id}`);
};

export const checkIn = async (id: string): Promise<Registration> => {
  const response = await api.patch(`/registrations/${id}/checkin`);
  return response.data;
};

export const checkInOnly = async (id: string): Promise<Registration> => {
  const response = await api.patch(`/registrations/${id}/checkin-only`);
  return response.data;
};

export const getRegistrationsByCpf = async (cpf: string): Promise<Registration[]> => {
  const response = await api.get('/registrations/by-cpf', {
    params: { cpf }
  });
  return response.data;
};

export const getPendingRegistrationByEmail = async (email: string, eventId: string): Promise<Registration | null> => {
  try {
    const response = await api.get('/registrations/pending-by-email', {
      params: { email, event_id: eventId }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Pagamento
export const createPayment = async (paymentData: PaymentData): Promise<any> => {
  const response = await api.post('/payments', paymentData);
  return response.data;
};

export const getPaymentStatus = async (paymentId: string): Promise<any> => {
  const response = await api.get(`/payments/${paymentId}`);
  return response.data;
};

export const getInstallments = async (amount: number, paymentMethodId: string = 'credit_card'): Promise<any> => {
  const response = await api.get('/payments/installments', {
    params: { amount, payment_method_id: paymentMethodId }
  });
  return response.data;
};

// Autenticação
export const login = async (email: string, password: string): Promise<{ token: string; user: any }> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const verifyToken = async (): Promise<any> => {
  const response = await api.get('/auth/verify');
  return response.data;
};

// Perguntas de Inscrição
export const getRegistrationQuestions = async (eventId: string): Promise<RegistrationQuestion[]> => {
  const response = await api.get(`/registration-questions/event/${eventId}`);
  return response.data;
};

export const getRegistrationQuestion = async (id: string): Promise<RegistrationQuestion> => {
  const response = await api.get(`/registration-questions/${id}`);
  return response.data;
};

export const createRegistrationQuestion = async (question: Omit<RegistrationQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<RegistrationQuestion> => {
  const response = await api.post('/registration-questions', question);
  return response.data;
};

export const updateRegistrationQuestion = async (id: string, question: Partial<Omit<RegistrationQuestion, 'id' | 'event_id' | 'created_at' | 'updated_at'>>): Promise<RegistrationQuestion> => {
  const response = await api.put(`/registration-questions/${id}`, question);
  return response.data;
};

export const deleteRegistrationQuestion = async (id: string): Promise<void> => {
  await api.delete(`/registration-questions/${id}`);
};

export const reorderRegistrationQuestions = async (eventId: string, questionIds: string[]): Promise<void> => {
  await api.put(`/registration-questions/event/${eventId}/reorder`, { questionIds });
};

export default api;
