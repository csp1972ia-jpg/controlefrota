-- =====================================================
-- SISTEMA DE CONTROLE DE FROTA DE VEÍCULOS
-- SUPABASE DATABASE SCHEMA
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: USERS (Condutores)
-- =====================================================
-- Equivalente à aba "Condutores" do Google Sheets

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nome_condutor TEXT NOT NULL,
  permissoes TEXT NOT NULL CHECK (permissoes IN ('ADMIN', 'USER')) DEFAULT 'USER',
  tipo INTEGER NOT NULL CHECK (tipo IN (1, 2)) DEFAULT 2, -- 1 = ADMIN, 2 = USER
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: VEHICLES (Cadastro de Veículos)
-- =====================================================
-- Equivalente à aba "Cadastro" do Google Sheets

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa TEXT NOT NULL UNIQUE,
  renavam TEXT NOT NULL,
  veiculo TEXT NOT NULL, -- Modelo do veículo
  empresa TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Disponível', 'Em Uso', 'Reservado')) DEFAULT 'Disponível',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: VEHICLE_USAGE (Retirada de Veículos)
-- =====================================================
-- Equivalente à aba "Retirada de Veículos" do Google Sheets

CREATE TABLE IF NOT EXISTS vehicle_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  condutor TEXT NOT NULL, -- Nome do condutor (denormalizado para facilitar buscas)
  veiculo TEXT NOT NULL, -- Nome do veículo (denormalizado)
  status TEXT NOT NULL CHECK (status IN ('Reservado', 'Em Uso', 'Finalizado')) DEFAULT 'Reservado',
  data_reserva DATE,
  data_saida DATE,
  hora_saida TIME,
  data_retorno DATE,
  hora_retorno TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: INFRACTIONS (Infrações)
-- =====================================================
-- Equivalente à aba "Infrações" do Google Sheets

CREATE TABLE IF NOT EXISTS infractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  auto_infracao TEXT NOT NULL,
  renainf TEXT,
  multa_original NUMERIC(10, 2),
  status TEXT,
  tipo_infracao TEXT,
  veiculo TEXT NOT NULL, -- Nome do veículo (denormalizado)
  data_infracao DATE NOT NULL,
  local TEXT,
  horario TIME,
  infracao TEXT,
  infrator TEXT, -- Preenchido automaticamente pelo trigger
  valor_original NUMERIC(10, 2),
  valor_liquido NUMERIC(10, 2),
  prazo_recurso DATE,
  prazo_identificacao DATE,
  vencimento DATE,
  boleto_impresso BOOLEAN DEFAULT false,
  condutor_identificado TEXT DEFAULT 'NÃO', -- SIM ou NÃO
  condutor_infrator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_placa ON vehicles(placa);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_vehicle ON vehicle_usage(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_user ON vehicle_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_dates ON vehicle_usage(data_saida, data_retorno);
CREATE INDEX IF NOT EXISTS idx_infractions_vehicle ON infractions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_infractions_data ON infractions(data_infracao);
CREATE INDEX IF NOT EXISTS idx_infractions_condutor ON infractions(condutor_infrator_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_usage_updated_at BEFORE UPDATE ON vehicle_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_infractions_updated_at BEFORE UPDATE ON infractions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: AUTO-IDENTIFICAR CONDUTOR EM INFRAÇÕES
-- =====================================================
-- Quando uma infração é cadastrada, busca automaticamente
-- o condutor que estava usando o veículo na data da infração

CREATE OR REPLACE FUNCTION auto_identify_driver()
RETURNS TRIGGER AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- Buscar uso do veículo que contenha a data da infração
  SELECT * INTO v_usage
  FROM vehicle_usage
  WHERE vehicle_id = NEW.vehicle_id
    AND data_saida IS NOT NULL
    AND data_saida <= NEW.data_infracao
    AND (data_retorno IS NULL OR data_retorno >= NEW.data_infracao)
  ORDER BY data_saida DESC
  LIMIT 1;

  -- Se encontrou um uso correspondente
  IF FOUND THEN
    NEW.condutor_infrator_id := v_usage.user_id;
    NEW.infrator := v_usage.condutor;
    NEW.condutor_identificado := 'SIM';
  ELSE
    -- Não encontrou condutor
    NEW.infrator := 'NÃO IDENTIFICADO';
    NEW.condutor_identificado := 'NÃO';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_identify_driver
  BEFORE INSERT OR UPDATE ON infractions
  FOR EACH ROW
  EXECUTE FUNCTION auto_identify_driver();

-- =====================================================
-- FUNCTION: ATUALIZAR STATUS DO VEÍCULO
-- =====================================================
-- Atualiza o status do veículo baseado nas ações de uso

CREATE OR REPLACE FUNCTION update_vehicle_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é uma nova reserva
  IF TG_OP = 'INSERT' AND NEW.status = 'Reservado' THEN
    UPDATE vehicles SET status = 'Reservado' WHERE id = NEW.vehicle_id;
  
  -- Se mudou para "Em Uso" (saída registrada)
  ELSIF NEW.status = 'Em Uso' AND (OLD IS NULL OR OLD.status != 'Em Uso') THEN
    UPDATE vehicles SET status = 'Em Uso' WHERE id = NEW.vehicle_id;
  
  -- Se mudou para "Finalizado" (devolução registrada)
  ELSIF NEW.status = 'Finalizado' AND (OLD IS NULL OR OLD.status != 'Finalizado') THEN
    UPDATE vehicles SET status = 'Disponível' WHERE id = NEW.vehicle_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_status
  AFTER INSERT OR UPDATE ON vehicle_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_status();

-- =====================================================
-- FUNCTION: PRIMEIRO USUÁRIO VIRA ADMIN
-- =====================================================
-- O primeiro usuário cadastrado no sistema será ADMIN

CREATE OR REPLACE FUNCTION set_first_user_as_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar quantos usuários existem
  SELECT COUNT(*) INTO user_count FROM users;

  -- Se este é o primeiro usuário
  IF user_count = 0 THEN
    NEW.permissoes := 'ADMIN';
    NEW.tipo := 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_first_user_admin
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_first_user_as_admin();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE infractions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    ) OR NOT EXISTS (SELECT 1 FROM users) -- Permite primeiro usuário
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    )
  );

-- Vehicles policies
CREATE POLICY "Users can view all vehicles" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert vehicles" ON vehicles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update vehicles" ON vehicles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete vehicles" ON vehicles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    )
  );

-- Vehicle Usage policies
CREATE POLICY "Users can view all usage" ON vehicle_usage
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own usage" ON vehicle_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own usage" ON vehicle_usage
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all usage" ON vehicle_usage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    )
  );

-- Infractions policies
CREATE POLICY "Users can view all infractions" ON infractions
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert infractions" ON infractions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update infractions" ON infractions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete infractions" ON infractions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND permissoes = 'ADMIN'
    )
  );

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Veículos com contagem de infrações
CREATE OR REPLACE VIEW vehicles_with_infraction_count AS
SELECT 
  v.*,
  COUNT(i.id) as total_infracoes
FROM vehicles v
LEFT JOIN infractions i ON v.id = i.vehicle_id
GROUP BY v.id;

-- View: Condutores com contagem de infrações
CREATE OR REPLACE VIEW users_with_infraction_count AS
SELECT 
  u.*,
  COUNT(i.id) as total_infracoes
FROM users u
LEFT JOIN infractions i ON u.id = i.condutor_infrator_id
GROUP BY u.id;

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================
-- Descomente para inserir dados de teste

-- INSERT INTO vehicles (placa, renavam, veiculo, empresa, status) VALUES
-- ('ABC-1234', '12345678901', 'Fiat Uno', 'Empresa A', 'Disponível'),
-- ('DEF-5678', '23456789012', 'VW Gol', 'Empresa B', 'Disponível'),
-- ('GHI-9012', '34567890123', 'Chevrolet Onix', 'Empresa A', 'Disponível');

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. O primeiro usuário criado será automaticamente ADMIN
-- 2. Ao cadastrar uma infração, o condutor é identificado automaticamente
-- 3. O status do veículo é atualizado automaticamente nas ações de uso
-- 4. Todas as tabelas têm RLS ativado para segurança
