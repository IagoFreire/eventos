// Selector para escolher entre API real e mock

import { mockApi } from '../mocks/api';
import * as realApi from './api';

// Verifica se está em modo offline
const isOfflineMode = () => {
  return import.meta.env.VITE_OFFLINE_MODE === 'true';
};

// Exporta a API apropriada baseado no modo
export const api = isOfflineMode() ? {
  // Mock API
  getEvent: mockApi.getEvent,
  getEvents: mockApi.getEvents,
  getEventStats: mockApi.getEventStats,
  updateEvent: mockApi.updateEvent,
  getEventSettings: mockApi.getEventSettings,
  updateEventSettings: mockApi.updateEventSettings,
  createRegistration: mockApi.createRegistration,
  getRegistrations: mockApi.getRegistrations,
  updateRegistration: mockApi.updateRegistration,
  checkIn: mockApi.checkIn,
  createPayment: mockApi.createPayment,
  getPaymentStatus: mockApi.getPaymentStatus,
  login: mockApi.login,
  verifyToken: mockApi.verifyToken,
} : {
  // Real API
  getEvent: realApi.getEvent,
  getEvents: realApi.getEvents,
  getEventStats: realApi.getEventStats,
  updateEvent: realApi.updateEvent,
  getEventSettings: realApi.getEventSettings,
  updateEventSettings: realApi.updateEventSettings,
  createRegistration: realApi.createRegistration,
  getRegistrations: realApi.getRegistrations,
  updateRegistration: realApi.updateRegistration,
  checkIn: realApi.checkIn,
  createPayment: realApi.createPayment,
  getPaymentStatus: realApi.getPaymentStatus,
  login: realApi.login,
  verifyToken: realApi.verifyToken,
};

// Log do modo atual
if (isOfflineMode()) {
  console.log('🔌 [OFFLINE MODE] Usando API mockada');
  console.log('📝 Credenciais de teste:');
  console.log('   Email: admin@igreja.com');
  console.log('   Senha: admin123');
} else {
  console.log('🌐 [ONLINE MODE] Usando API real');
}
