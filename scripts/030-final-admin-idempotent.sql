-- =================================================================
-- Script SQL Definitivo e Idempotente per il Backend Admin
-- Versione: 030
-- Obiettivo: Creare e configurare tutte le tabelle, funzioni e
-- policy necessarie per il pannello di amministrazione.
-- Eseguire questo script per risolvere gli errori precedenti.
-- =================================================================

-- Estensioni necessarie (se non già presenti)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- Funzioni di Supporto e Sicurezza
-- =================================================================

-- Funzione per controllare se un utente è amministratore
-- FIX: Usa DROP/CREATE per garantire che la funzione sia sempre aggiornata
DROP FUNCTION IF EXISTS is_admin(user_id uuid);
CREATE OR REPLACE FUNCTION is_admin(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = p_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- Tabella Promozioni
-- =================================================================

-- Creazione della tabella per le promozioni
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    special_price numeric(10, 2) NOT NULL CHECK (special_price >= 0),
    original_price numeric(10, 2) NOT NULL CHECK (original_price > 0),
    discount_percentage integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    valid_days text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz
);

-- Policy di Sicurezza per la tabella promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gli admin possono gestire le promozioni" ON public.promotions;
CREATE POLICY "Gli admin possono gestire le promozioni"
ON public.promotions FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- =================================================================
-- Funzioni RPC per il Pannello Admin
-- =================================================================

-- Funzione per ottenere le statistiche della dashboard
-- FIX: Corregge i nomi delle colonne e gestisce i valori NULL
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, total_consultations bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM auth.users) AS total_users,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'Attivo') AS total_operators,
    COALESCE((SELECT sum(amount) FROM public.credit_transactions WHERE type = 'purchase'), 0) AS total_revenue,
    (SELECT count(*) FROM public.consultations WHERE status = 'completed') AS total_consultations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Funzione per ottenere tutte le promozioni
DROP FUNCTION IF EXISTS get_all_promotions();
CREATE OR REPLACE FUNCTION get_all_promotions()
RETURNS SETOF public.promotions AS $$
BEGIN
  IF is_admin(auth.uid()) THEN
    RETURN QUERY SELECT * FROM public.promotions ORDER BY created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- Fine dello script
-- =================================================================
