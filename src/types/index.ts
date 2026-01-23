export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  image_url?: string;
  max_participants?: number;
}

export interface EventSettings {
  id: string;
  event_id: string;
  // Informações do Evento
  event_subtitle?: string;
  event_time?: string;
  // O que está incluído
  included_items: IncludedItem[];
  // Informações da Igreja
  church_name: string;
  church_contact_phone?: string;
  church_contact_email?: string;
  church_instagram?: string;
  church_facebook?: string;
  church_website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IncludedItem {
  icon: string;
  title: string;
  description: string;
}

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  payment_status: 'pending' | 'approved' | 'rejected';
  payment_id?: string;
  payment_method?: string;
  payment_amount?: number;
  payment_date?: string;
  checked_in: boolean;
  checked_in_date?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface PaymentData {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}
