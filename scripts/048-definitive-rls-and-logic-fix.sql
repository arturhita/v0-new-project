-- Questo script corregge l'errore nella policy di sicurezza (RLS)
-- e assicura che la logica sia corretta.

-- 1. Funzione per le statistiche della dashboard (con COALESCE per robustezza)
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, pending_operators bigint, total_revenue numeric, monthly_revenue numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM auth.users WHERE (raw_app_meta_data->>'role' = 'client' OR raw_app_meta_data->>'role' IS NULL)) AS total_users,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'approved') AS total_operators,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'pending') AS pending_operators,
    COALESCE((SELECT sum(amount) FROM public.transactions WHERE type = 'charge'), 0) AS total_revenue,
    COALESCE((SELECT sum(amount) FROM public.transactions WHERE type = 'charge' AND created_at >= date_trunc('month', now())), 0) AS monthly_revenue;
END;
$$;

-- 2. Funzione is_admin (fondamentale per le policy)
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id AND role = 'admin'
  );
END;
$$;

-- 3. Correzione delle Policy di Sicurezza (RLS) per commission_increase_requests
ALTER TABLE public.commission_increase_requests ENABLE ROW LEVEL SECURITY;

-- Elimina le policy esistenti prima di ricrearle per evitare errori
DROP POLICY IF EXISTS "Operators can create their own requests" ON public.commission_increase_requests;
DROP POLICY IF EXISTS "Admins can manage all commission requests" ON public.commission_increase_requests;

-- Ricrea le policy con la logica corretta
-- Correzione: La tabella 'profiles' ha una colonna 'id', non 'user_id'.
CREATE POLICY "Operators can create their own requests"
ON public.commission_increase_requests
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = operator_id) = 'operator' AND
  operator_id = auth.uid()
);

CREATE POLICY "Admins can manage all commission requests"
ON public.commission_increase_requests
FOR ALL
USING (is_admin(auth.uid()));

-- 4. Assicura che le altre tabelle abbiano RLS abilitato e policy corrette
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can see all payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Operators can see their own payout requests" ON public.payout_requests;

CREATE POLICY "Admins can see all payout requests" ON public.payout_requests FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Operators can see their own payout requests" ON public.payout_requests FOR SELECT USING ((SELECT user_id FROM public.profiles WHERE id = operator_id) = auth.uid());

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;

CREATE POLICY "Public can view active promotions" ON public.promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL USING (is_admin(auth.uid()));

ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage broadcast notifications" ON public.broadcast_notifications;
CREATE POLICY "Admins can manage broadcast notifications" ON public.broadcast_notifications FOR ALL USING (is_admin(auth.uid()));
