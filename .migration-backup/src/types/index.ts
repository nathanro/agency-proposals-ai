// Tipos principales del sistema

export interface Agency {
  id: string;
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  custom_domain?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceTemplate {
  id: string;
  agency_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  deliverables: string[];
  ai_generated_tasks: Task[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  agency_id: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  service_template_id: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'paid';
  custom_message?: string;
  discount_percentage?: number;
  final_price: number;
  currency: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  agency_id: string;
  proposal_id: string;
  client_name: string;
  client_email: string;
  service_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  start_date: string;
  estimated_end_date: string;
  actual_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  order: number;
  dependencies?: string[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  proposal_id: string;
  project_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: 'openpayments' | 'stripe' | 'manual';
  transaction_id?: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  agency_id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhiteLabelConfig {
  id: string;
  agency_id: string;
  custom_logo_url?: string;
  custom_favicon_url?: string;
  custom_css?: string;
  custom_domain?: string;
  email_from_name?: string;
  email_from_address?: string;
  smtp_config?: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  branding: {
    hide_branding: boolean;
    custom_support_email?: string;
    custom_terms_url?: string;
    custom_privacy_url?: string;
  };
  created_at: string;
  updated_at: string;
}