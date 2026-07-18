-- Schema para Agency Proposals AI
-- Ejecutar esto en el SQL Editor de Supabase

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de agencias (multi-tenancy)
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4F46E5',
  secondary_color VARCHAR(7) DEFAULT '#7C3AED',
  custom_domain VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de miembros del equipo
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de templates de servicios
CREATE TABLE service_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  duration_days INTEGER DEFAULT 30,
  deliverables JSONB DEFAULT '[]',
  ai_generated_tasks JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de propuestas
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_company VARCHAR(255),
  service_template_id UUID NOT NULL REFERENCES service_templates(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'paid')),
  custom_message TEXT,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proyectos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_end_date TIMESTAMP WITH TIME ZONE,
  actual_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(5, 2),
  order_index INTEGER DEFAULT 0,
  dependencies JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50) DEFAULT 'openpayments' CHECK (payment_method IN ('openpayments', 'stripe', 'manual')),
  transaction_id VARCHAR(255),
  wallet_address VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración white-label
CREATE TABLE white_label_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  custom_logo_url TEXT,
  custom_favicon_url TEXT,
  custom_css TEXT,
  custom_domain VARCHAR(255),
  email_from_name VARCHAR(255),
  email_from_address VARCHAR(255),
  smtp_config JSONB,
  branding JSONB DEFAULT '{"hide_branding": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_agencies_created_at ON agencies(created_at);
CREATE INDEX idx_team_members_agency_id ON team_members(agency_id);
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_service_templates_agency_id ON service_templates(agency_id);
CREATE INDEX idx_proposals_agency_id ON proposals(agency_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_projects_agency_id ON projects(agency_id);
CREATE INDEX idx_projects_proposal_id ON projects(proposal_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_payments_proposal_id ON payments(proposal_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_white_label_configs_agency_id ON white_label_configs(agency_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_templates_updated_at BEFORE UPDATE ON service_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_white_label_configs_updated_at BEFORE UPDATE ON white_label_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RSL básicas (se pueden refinar según necesidad)
CREATE POLICY "Usuarios pueden ver su propia agencia" ON agencies
  FOR SELECT USING (id IN (
    SELECT agency_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins pueden insertar agencias" ON agencies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins pueden actualizar agencias" ON agencies
  FOR UPDATE USING (true);

CREATE POLICY "Miembros pueden ver su equipo" ON team_members
  FOR SELECT USING (agency_id IN (
    SELECT agency_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Miembros pueden ver templates de su agencia" ON service_templates
  FOR SELECT USING (agency_id IN (
    SELECT agency_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Miembros pueden ver propuestas de su agencia" ON proposals
  FOR SELECT USING (agency_id IN (
    SELECT agency_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Miembros pueden ver proyectos de su agencia" ON projects
  FOR SELECT USING (agency_id IN (
    SELECT agency_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Miembros pueden ver tareas de sus proyectos" ON tasks
  FOR SELECT USING (project_id IN (
    SELECT id FROM projects WHERE agency_id IN (
      SELECT agency_id FROM team_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Miembros pueden ver pagos de su agencia" ON payments
  FOR SELECT USING (proposal_id IN (
    SELECT id FROM proposals WHERE agency_id IN (
      SELECT agency_id FROM team_members WHERE user_id = auth.uid()
    )
  ));