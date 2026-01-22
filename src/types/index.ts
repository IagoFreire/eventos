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
