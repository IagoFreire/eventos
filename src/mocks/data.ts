import type { Event, Registration, User } from '../types';

// Evento mockado
export const mockEvent: Event = {
  id: '1',
  title: 'Retiro Espiritual 2026',
  description: 'Venha viver três dias de renovação espiritual, louvor e adoração. Um tempo especial de comunhão com Deus e com nossos irmãos em Cristo. Inclui alimentação completa, hospedagem e todas as atividades programadas.',
  date: '2026-03-15T09:00:00',
  location: 'Centro de Retiros Nova Vida - Serra da Mantiqueira, MG',
  price: 350.00,
  image_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
  max_participants: 100,
};

// Lista de eventos mockados
export const mockEvents: Event[] = [
  mockEvent,
  {
    id: '2',
    title: 'Congresso de Jovens 2026',
    description: 'Um encontro transformador para jovens de todas as igrejas. Música, palestras inspiradoras e networking.',
    date: '2026-04-20T19:00:00',
    location: 'Centro de Convenções - São Paulo, SP',
    price: 180.00,
    image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    max_participants: 500,
  },
  {
    id: '3',
    title: 'Escola Bíblica de Férias',
    description: 'Para crianças de 6 a 12 anos. Uma semana de diversão, aprendizado e crescimento espiritual.',
    date: '2026-07-10T08:00:00',
    location: 'Igreja Central - Rio de Janeiro, RJ',
    price: 80.00,
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    max_participants: 150,
  },
];

// Inscrições mockadas
export const mockRegistrations: Registration[] = [
  {
    id: 'reg-1',
    event_id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    address: 'Rua das Flores, 123, Centro, São Paulo, SP',
    payment_status: 'approved',
    payment_id: 'pay-123',
    checked_in: true,
    created_at: '2026-01-15T10:30:00',
  },
  {
    id: 'reg-2',
    event_id: '1',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 98765-1234',
    cpf: '987.654.321-00',
    address: 'Av. Paulista, 1000, Bela Vista, São Paulo, SP',
    payment_status: 'approved',
    payment_id: 'pay-124',
    checked_in: true,
    created_at: '2026-01-16T14:20:00',
  },
  {
    id: 'reg-3',
    event_id: '1',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 98765-5678',
    cpf: '456.789.123-00',
    address: 'Rua Augusta, 500, Consolação, São Paulo, SP',
    payment_status: 'pending',
    payment_id: 'pay-125',
    checked_in: false,
    created_at: '2026-01-18T09:15:00',
  },
  {
    id: 'reg-4',
    event_id: '1',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 98765-8765',
    cpf: '321.654.987-00',
    address: 'Rua dos Pinheiros, 200, Pinheiros, São Paulo, SP',
    payment_status: 'approved',
    payment_id: 'pay-126',
    checked_in: false,
    created_at: '2026-01-19T16:45:00',
  },
  {
    id: 'reg-5',
    event_id: '1',
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    phone: '(11) 98765-3456',
    cpf: '654.321.789-00',
    address: 'Av. Brasil, 3000, Jardins, São Paulo, SP',
    payment_status: 'rejected',
    payment_id: 'pay-127',
    checked_in: false,
    created_at: '2026-01-20T11:30:00',
  },
  {
    id: 'reg-6',
    event_id: '2',
    name: 'Julia Mendes',
    email: 'julia.mendes@email.com',
    phone: '(11) 98765-9876',
    cpf: '789.123.456-00',
    address: 'Rua da Consolação, 800, Centro, São Paulo, SP',
    payment_status: 'approved',
    payment_id: 'pay-128',
    checked_in: false,
    created_at: '2026-01-21T13:00:00',
  },
];

// Usuário admin mockado
export const mockAdmin: User = {
  id: 'user-1',
  email: 'admin@igreja.com',
  role: 'admin',
};

// Token JWT mockado (fake)
export const mockToken = 'mock-jwt-token-12345';

// Delay para simular latência de rede
export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));
