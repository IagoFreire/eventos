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
  getEventDates: mockApi.getEventDates || (async () => []),
  updateEventDates: mockApi.updateEventDates || (async () => []),
  createRegistration: mockApi.createRegistration,
  getRegistrations: mockApi.getRegistrations,
  getRegistrationById: mockApi.getRegistrationById,
  checkPaymentStatus: mockApi.getRegistrationById, // Usar mesma função do mock
  getRegistrationsByCpf: mockApi.getRegistrationsByCpf || (async () => []),
  getPendingRegistrationByEmail: mockApi.getPendingRegistrationByEmail || (async () => null),
  updateRegistration: mockApi.updateRegistration,
  deleteRegistration: mockApi.deleteRegistration,
  checkIn: mockApi.checkIn,
  checkInOnly: mockApi.checkInOnly || mockApi.checkIn,
  createPayment: mockApi.createPayment,
  getPaymentStatus: mockApi.getPaymentStatus,
  getInstallments: mockApi.getInstallments,
  login: mockApi.login,
  verifyToken: mockApi.verifyToken,
  getRegistrationQuestions: realApi.getRegistrationQuestions,
  getRegistrationQuestion: realApi.getRegistrationQuestion,
  createRegistrationQuestion: realApi.createRegistrationQuestion,
  updateRegistrationQuestion: realApi.updateRegistrationQuestion,
  deleteRegistrationQuestion: realApi.deleteRegistrationQuestion,
  reorderRegistrationQuestions: realApi.reorderRegistrationQuestions,
} : {
  // Real API
  getEvent: realApi.getEvent,
  getEvents: realApi.getEvents,
  getEventStats: realApi.getEventStats,
  updateEvent: realApi.updateEvent,
  getEventSettings: realApi.getEventSettings,
  updateEventSettings: realApi.updateEventSettings,
  getEventDates: realApi.getEventDates,
  updateEventDates: realApi.updateEventDates,
  createRegistration: realApi.createRegistration,
  getRegistrations: realApi.getRegistrations,
  getRegistrationById: realApi.getRegistrationById,
  checkPaymentStatus: realApi.checkPaymentStatus,
  getRegistrationsByCpf: realApi.getRegistrationsByCpf,
  getPendingRegistrationByEmail: realApi.getPendingRegistrationByEmail,
  updateRegistration: realApi.updateRegistration,
  deleteRegistration: realApi.deleteRegistration,
  checkIn: realApi.checkIn,
  checkInOnly: realApi.checkInOnly,
  createPayment: realApi.createPayment,
  getPaymentStatus: realApi.getPaymentStatus,
  getInstallments: realApi.getInstallments,
  login: realApi.login,
  verifyToken: realApi.verifyToken,
  getRegistrationQuestions: realApi.getRegistrationQuestions,
  getRegistrationQuestion: realApi.getRegistrationQuestion,
  createRegistrationQuestion: realApi.createRegistrationQuestion,
  updateRegistrationQuestion: realApi.updateRegistrationQuestion,
  deleteRegistrationQuestion: realApi.deleteRegistrationQuestion,
  reorderRegistrationQuestions: realApi.reorderRegistrationQuestions,
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
