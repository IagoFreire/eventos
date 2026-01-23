import axios from 'axios';
import type { Event, Registration, PaymentData, EventSettings } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
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

// Inscrições
export const createRegistration = async (registration: Omit<Registration, 'id' | 'created_at' | 'checked_in' | 'payment_status'>): Promise<Registration> => {
  const response = await api.post('/registrations', registration);
  return response.data;
};

export const getRegistrations = async (eventId?: string): Promise<Registration[]> => {
  const response = await api.get('/registrations', {
    params: { event_id: eventId }
  });
  return response.data;
};

export const updateRegistration = async (id: string, data: Partial<Registration>): Promise<Registration> => {
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

export const getRegistrationsByCpf = async (cpf: string): Promise<Registration[]> => {
  const response = await api.get('/registrations/by-cpf', {
    params: { cpf }
  });
  return response.data;
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

export default api;
