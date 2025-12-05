-- Script para corrigir o trigger de identificação de infrator
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- FUNCTION: AUTO-IDENTIFICAR CONDUTOR EM INFRAÇÕES (CORRIGIDA)
-- =====================================================

CREATE OR REPLACE FUNCTION auto_identify_driver()
RETURNS TRIGGER AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- Buscar uso do veículo que contenha a data da infração
  -- Agora comparando apenas as datas (sem considerar hora)
  SELECT * INTO v_usage
  FROM vehicle_usage
  WHERE vehicle_id = NEW.vehicle_id
    AND data_saida IS NOT NULL
    AND DATE(data_saida) <= NEW.data_infracao
    AND (data_retorno IS NULL OR DATE(data_retorno) >= NEW.data_infracao)
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

-- Recriar o trigger
DROP TRIGGER IF EXISTS trigger_auto_identify_driver ON infractions;

CREATE TRIGGER trigger_auto_identify_driver
  BEFORE INSERT OR UPDATE ON infractions
  FOR EACH ROW
  EXECUTE FUNCTION auto_identify_driver();
