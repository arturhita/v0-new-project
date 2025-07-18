-- Questo script è la soluzione definitiva che fa tabula rasa delle policy prima di ricrearle.

-- 1. Rimuove esplicitamente OGNI policy di amministrazione per evitare errori di conflitto.
DROP POLICY IF EXISTS "Allow admin full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access on platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Allow admin full access on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow admin full access on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
DROP POLICY IF EXISTS "Allow admin full access on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin full access on tickets" ON public.tickets;
DROP POLICY IF EXISTS "Allow admin full access on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow admins full access to operator profiles" ON public.operator_profiles;
DROP POLICY IF EXISTS "Allow admins read access to all invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow admins write access to all invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins can manage all commission requests" ON public.commission_increase_requests;
DROP POLICY IF EXISTS "Admins can see all payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Admins can manage broadcast notifications" ON public.broadcast_notifications;

-- 2. Ora che le dipendenze sono rimosse, elimina le funzioni in modo sicuro.
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();

-- 3. Ricrea le funzioni da zero.
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

-- 4. Ricrea tutte le policy di amministrazione su un database pulito.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_increase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access on profiles" ON public.profiles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on platform_settings" ON public.platform_settings FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on posts" ON public.posts FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on reviews" ON public.reviews FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on invoices" ON public.invoices FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on tickets" ON public.tickets FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on notifications" ON public.notifications FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow admins full access to operator profiles" ON public.operator_profiles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow admins read access to all invoice items" ON public.invoice_items FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Allow admins write access to all invoice items" ON public.invoice_items FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage all commission requests" ON public.commission_increase_requests FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can see all payout requests" ON public.payout_requests FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage broadcast notifications" ON public.broadcast_notifications FOR ALL USING (is_admin(auth.uid()));
