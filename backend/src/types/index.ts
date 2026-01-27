export interface EventDate {
  id: string;
  event_id: string;
  date: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date | string; // Mantido para compatibilidade
  dates?: EventDate[]; // Array de datas do evento
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
  event_title_image_url?: string;
  event_title_background_image_url?: string;
  event_title_text_color?: string;
  event_title_button_color?: string;
  event_title_button_text_color?: string;
  event_title_font_weight?: string;
  included_items: IncludedItem[];
  church_name: string;
  church_contact_phone?: string; // Mantido para compatibilidade
  contact_phones?: ContactPhone[]; // Array de telefones com descrição
  church_contact_email?: string;
  church_instagram?: string;
  church_facebook?: string;
  church_website?: string;
  show_contact?: boolean;
  show_social?: boolean;
  show_contact_phone?: boolean;
  show_contact_email?: boolean;
  show_social_instagram?: boolean;
  show_social_facebook?: boolean;
  show_social_website?: boolean;
  confirmed_participants?: ConfirmedParticipant[];
  show_included_items?: boolean;
  show_confirmed_participants?: boolean;
  show_available_spots?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface IncludedItem {
  icon: string;
  title: string;
  description: string;
}

export interface ContactPhone {
  id: string;
  phone: string;
  description: string;
  use_for_pix_support: boolean;
}

export interface ConfirmedParticipant {
  name: string;
  description: string;
  image_url?: string;
  instagram?: string;
}

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  payment_status: 'pending' | 'approved' | 'rejected';
  payment_id?: string;
  payment_method?: string; // Método usado para controle interno (pode ser sobrescrito)
  selected_payment_method?: string; // Método escolhido pelo usuário (pix ou credit_card)
  payment_amount?: number;
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

export interface RegistrationQuestion {
  id: string;
  event_id: string;
  question_text: string;
  question_type: 'text' | 'single_choice' | 'multiple_choice';
  options: string[]; // Array de opções para single_choice e multiple_choice
  is_required: boolean;
  display_order: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface RegistrationAnswer {
  id: string;
  registration_id: string;
  question_id: string;
  answer_text?: string; // Para tipo 'text' ou quando a resposta é texto
  answer_options?: string[]; // Array de opções selecionadas para multiple_choice
  created_at?: Date | string;
  updated_at?: Date | string;
}