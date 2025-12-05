-- =====================================================
-- SCRIPT PARA DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================
-- Execute este script no Supabase SQL Editor para permitir
-- operações sem autenticação do Supabase Auth

-- Desabilitar RLS em todas as tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE infractions DISABLE ROW LEVEL SECURITY;

-- NOTA: Em produção, você deve implementar autenticação
-- adequada com Supabase Auth e manter o RLS ativado
