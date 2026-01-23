export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  location: string;
  price: number;
  image_url?: string;
  max_participants?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface EventSettings {
  id: string;
  event_id: string;
  event_subtitle?: string;
  event_time?: string;
  included_items: IncludedItem[];
  church_name: string;
  church_contact_phone?: string;
  church_contact_email?: string;
  church_instagram?: string;
  church_facebook?: string;
  church_website?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
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
  checked_in: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  role: 'admin' | 'user';
  created_at?: Date | string;
  updated_at?: Date | string;
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
