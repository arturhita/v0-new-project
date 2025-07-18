-- Questo script è progettato per essere eseguito in sicurezza più volte.
-- Pulisce e ricrea le funzioni e le tabelle necessarie per il pannello admin.

-- Funzione per controllare se l'utente è un amministratore
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Abilita RLS (Row Level Security) sulle tabelle critiche se non già abilitato
ALTER TABLE if exists public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE if exists public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE if exists public.commission_requests ENABLE ROW LEVEL SECURITY;

-- Rimuove le vecchie policy per evitare conflitti
DROP POLICY IF EXISTS "Admin can manage promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admin can manage payouts" ON public.payout_requests;
DROP POLICY IF EXISTS "Admin can manage commission requests" ON public.commission_requests;

-- Crea le tabelle se non esistono

-- Tabella Promozioni
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    special_price numeric(10, 2) NOT NULL,
    original_price numeric(10, 2) NOT NULL,
    discount_percentage integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    start_time time,
    end_time time,
    valid_days text[] NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabella Richieste di Pagamento (Payouts)
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric(10, 2) NOT NULL,
    status text DEFAULT 'pending'::text, -- pending, approved, rejected
    request_date timestamp with time zone DEFAULT now(),
    processed_date timestamp with time zone,
    admin_notes text,
    operator_notes text
);

-- Tabella Richieste di Commissione
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requested_rate numeric(5, 2) NOT NULL,
    current_rate numeric(5, 2) NOT NULL,
    reason text,
    status text DEFAULT 'pending'::text, -- pending, approved, rejected
    request_date timestamp with time zone DEFAULT now(),
    processed_date timestamp with time zone,
    admin_notes text
);

-- Policy di sicurezza: solo gli admin possono gestire queste tabelle
CREATE POLICY "Admin can manage promotions" ON public.promotions
    FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin can manage payouts" ON public.payout_requests
    FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin can manage commission requests" ON public.commission_requests
    FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Funzione RPC per le statistiche della Dashboard
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, total_consultations bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM auth.users) AS total_users,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'Attivo') AS total_operators,
    (SELECT COALESCE(sum(amount), 0) FROM public.wallet_transactions WHERE type = 'deposit') AS total_revenue,
    (SELECT count(*) FROM public.consultations WHERE status = 'completed') AS total_consultations;
END;
$$ LANGUAGE plpgsql;

-- Funzioni RPC per recuperare i dati (semplifica le chiamate dal frontend)
CREATE OR REPLACE FUNCTION get_all_promotions()
RETURNS SETOF promotions AS $$
  SELECT * FROM public.promotions ORDER BY created_at DESC;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_payout_requests_with_details()
RETURNS TABLE(id uuid, operator_id uuid, stage_name text, avatar_url text, amount numeric, status text, request_date timestamptz) AS $$
  SELECT
    pr.id,
    pr.operator_id,
    p.stage_name,
    p.avatar_url,
    pr.amount,
    pr.status,
    pr.request_date
  FROM public.payout_requests pr
  JOIN public.profiles p ON pr.operator_id = p.id
  ORDER BY pr.request_date DESC;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_commission_requests_with_details()
RETURNS TABLE(id uuid, operator_id uuid, stage_name text, avatar_url text, requested_rate numeric, current_rate numeric, reason text, status text, request_date timestamptz) AS $$
  SELECT
    cr.id,
    cr.operator_id,
    p.stage_name,
    p.avatar_url,
    cr.requested_rate,
    cr.current_rate,
    cr.reason,
    cr.status,
    cr.request_date
  FROM public.commission_requests cr
  JOIN public.profiles p ON cr.operator_id = p.id
  ORDER BY cr.request_date DESC;
$$ LANGUAGE sql;
