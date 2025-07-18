-- Questo script è la soluzione definitiva che gestisce correttamente le dipendenze del database.
-- Utilizza CASCADE per rimuovere le funzioni e le policy dipendenti prima di ricrearle.

-- 1. Rimuove in modo sicuro la funzione is_admin e TUTTE le policy che dipendono da essa.
-- Questo risolve l'errore di dipendenza "cannot drop function".
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();

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

-- 3. Ricrea la funzione per le statistiche della dashboard
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

-- 4. Ricrea TUTTE le policy di sicurezza per l'amministratore che sono state rimosse da CASCADE.
-- Questo garantisce che l'amministratore abbia i permessi corretti in tutta l'applicazione.

-- Policy per 'profiles'
CREATE POLICY "Allow admin full access on profiles" ON public.profiles FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'platform_settings'
CREATE POLICY "Allow admin full access on platform_settings" ON public.platform_settings FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'posts'
CREATE POLICY "Allow admin full access on posts" ON public.posts FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'reviews'
CREATE POLICY "Allow admin full access on reviews" ON public.reviews FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'promotions'
CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'invoices'
CREATE POLICY "Allow admin full access on invoices" ON public.invoices FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'tickets'
CREATE POLICY "Allow admin full access on tickets" ON public.tickets FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'notifications'
CREATE POLICY "Allow admin full access on notifications" ON public.notifications FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'operator_profiles'
CREATE POLICY "Allow admins full access to operator profiles" ON public.operator_profiles FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'invoice_items'
CREATE POLICY "Allow admins read access to all invoice items" ON public.invoice_items FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Allow admins write access to all invoice items" ON public.invoice_items FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'commission_increase_requests'
CREATE POLICY "Admins can manage all commission requests" ON public.commission_increase_requests FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'payout_requests'
CREATE POLICY "Admins can see all payout requests" ON public.payout_requests FOR ALL USING (is_admin(auth.uid()));
-- Policy per 'broadcast_notifications'
CREATE POLICY "Admins can manage broadcast notifications" ON public.broadcast_notifications FOR ALL USING (is_admin(auth.uid()));

-- 5. Assicura che le altre policy non-admin esistano ancora
-- (Queste non vengono droppate da CASCADE ma è buona norma assicurarsi che ci siano)
CREATE POLICY "Operators can create their own requests" ON public.commission_increase_requests FOR ALL USING (operator_id = auth.uid()) WITH CHECK (operator_id = auth.uid());
CREATE POLICY "Operators can see their own payout requests" ON public.payout_requests FOR SELECT USING (operator_id = auth.uid());
CREATE POLICY "Public can view active promotions" ON public.promotions FOR SELECT USING (is_active = true);
