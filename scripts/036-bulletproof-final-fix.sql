-- =================================================================
-- SCRIPT SQL "A PROVA DI PROIETTILE" v1
-- Questo script è progettato per risolvere tutti gli errori precedenti.
-- Usa DROP...IF EXISTS per garantire che possa essere eseguito in sicurezza.
-- =================================================================

-- 1. RIMOZIONE SICURA DI OGGETTI ESISTENTI E PROBLEMATICI
-- =================================================================
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();
DROP FUNCTION IF EXISTS public.is_admin();
DROP TRIGGER IF EXISTS on_new_operator_application ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_operator_application_notification();


-- =================================================================
-- 2. CREAZIONE DELLA FUNZIONE is_admin() (CORRETTA E DEFINITIVA)
-- =================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- =================================================================
-- 3. CREAZIONE DI TUTTE LE TABELLE NECESSARIE (CON IF NOT EXISTS)
-- =================================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.advanced_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, closed
    priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
    discount_value NUMERIC NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- =================================================================
-- 4. CREAZIONE TRIGGER E FUNZIONI (CORRETTI)
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_operator_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_notifications (message, link)
  VALUES ('Nuova richiesta di approvazione operatore: ' || COALESCE(NEW.full_name, 'Nome non specificato'), '/admin/operator-approvals');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_operator_application
AFTER INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'operator' AND NEW.status = 'pending')
EXECUTE FUNCTION public.handle_new_operator_application_notification();


-- =================================================================
-- 5. FUNZIONE PER LE STATISTICHE DEL CRUSCOTTO (CORRETTA)
-- =================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb -- Usiamo jsonb per maggiore efficienza
LANGUAGE plpgsql
AS $$
DECLARE
    total_users bigint;
    total_operators bigint;
    pending_operators bigint;
    total_revenue numeric;
    monthly_revenue numeric;
BEGIN
    SELECT count(*) INTO total_users FROM public.profiles WHERE role = 'client';
    SELECT count(*) INTO total_operators FROM public.profiles WHERE role = 'operator' AND status = 'active';
    SELECT count(*) INTO pending_operators FROM public.profiles WHERE role = 'operator' AND status = 'pending';
    SELECT COALESCE(sum(amount), 0) INTO total_revenue FROM public.transactions WHERE status = 'succeeded';
    SELECT COALESCE(sum(amount), 0) INTO monthly_revenue FROM public.transactions WHERE status = 'succeeded' AND created_at >= date_trunc('month', now());

    RETURN jsonb_build_object(
        'totalUsers', total_users,
        'totalOperators', total_operators,
        'pendingOperators', pending_operators,
        'totalRevenue', total_revenue,
        'monthlyRevenue', monthly_revenue
    );
END;
$$;


-- =================================================================
-- 6. APPLICAZIONE POLICY DI SICUREZZA (RLS)
-- =================================================================
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can access all notifications" ON public.admin_notifications;
CREATE POLICY "Admins can access all notifications" ON public.admin_notifications FOR ALL USING (public.is_admin());

ALTER TABLE public.advanced_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage advanced settings" ON public.advanced_settings;
CREATE POLICY "Admins can manage advanced settings" ON public.advanced_settings FOR ALL USING (public.is_admin());

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Users can CRUD their own tickets" ON public.support_tickets;
CREATE POLICY "Users can CRUD their own tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all replies" ON public.ticket_replies;
CREATE POLICY "Admins can manage all replies" ON public.ticket_replies FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Users can view replies on their tickets" ON public.ticket_replies;
CREATE POLICY "Users can view replies on their tickets" ON public.ticket_replies FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL USING (public.is_admin());


-- =================================================================
-- 7. VISTA PER GLI UTENTI (CORRETTA)
-- =================================================================
CREATE OR REPLACE VIEW public.detailed_users AS
SELECT
    u.id,
    u.email,
    u.created_at AS user_created_at,
    u.last_sign_in_at,
    p.full_name,
    p.role,
    p.status,
    p.avatar_url
FROM
    auth.users u
LEFT JOIN
    public.profiles p ON u.id = p.id;
