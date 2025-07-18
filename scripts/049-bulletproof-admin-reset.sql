-- Questo script è progettato per essere eseguito in modo sicuro,
-- eliminando le vecchie configurazioni prima di crearne di nuove
-- per evitare conflitti e correggere errori logici.

-- 1. Rimuove in modo sicuro le funzioni esistenti per evitare errori di conflitto.
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- 2. Ricrea la funzione is_admin (fondamentale per la sicurezza)
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

-- 3. Ricrea la funzione per le statistiche della dashboard (con COALESCE per robustezza)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, pending_operators bigint, total_revenue numeric, monthly_revenue numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM auth.users WHERE raw_app_meta_data->>'role' = 'client' OR raw_app_meta_data->>'role' IS NULL) AS total_users,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'approved') AS total_operators,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'pending') AS pending_operators,
    COALESCE((SELECT sum(amount) FROM public.transactions WHERE type = 'charge'), 0) AS total_revenue,
    COALESCE((SELECT sum(amount) FROM public.transactions WHERE type = 'charge' AND created_at >= date_trunc('month', now())), 0) AS monthly_revenue;
END;
$$;

-- 4. Abilita RLS e ricrea le policy per commission_increase_requests
ALTER TABLE public.commission_increase_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Operators can create their own requests" ON public.commission_increase_requests;
DROP POLICY IF EXISTS "Admins can manage all commission requests" ON public.commission_increase_requests;

CREATE POLICY "Operators can create their own requests"
ON public.commission_increase_requests
FOR ALL
USING ( operator_id = auth.uid() )
WITH CHECK ( operator_id = auth.uid() );

CREATE POLICY "Admins can manage all commission requests"
ON public.commission_increase_requests
FOR ALL
USING (is_admin(auth.uid()));

-- 5. Abilita RLS e ricrea le policy per payout_requests (CON LOGICA CORRETTA)
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can see all payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Operators can see their own payout requests" ON public.payout_requests;

CREATE POLICY "Admins can see all payout requests" ON public.payout_requests FOR ALL USING (is_admin(auth.uid()));
-- Correzione logica: l'operatore può vedere solo le sue richieste.
CREATE POLICY "Operators can see their own payout requests" ON public.payout_requests FOR SELECT USING (operator_id = auth.uid());

-- 6. Abilita RLS e ricrea le policy per promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;

CREATE POLICY "Public can view active promotions" ON public.promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL USING (is_admin(auth.uid()));

-- 7. Abilita RLS e ricrea le policy per broadcast_notifications
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage broadcast notifications" ON public.broadcast_notifications;
CREATE POLICY "Admins can manage broadcast notifications" ON public.broadcast_notifications FOR ALL USING (is_admin(auth.uid()));
