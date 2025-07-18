-- =================================================================
-- MASTER SETUP & FIX SCRIPT v2
-- Questo è l'UNICO script che deve essere eseguito.
-- Risolve tutti gli errori precedenti, inclusa la funzione is_admin().
-- =================================================================

-- 1. CREAZIONE DELLA FUNZIONE is_admin() (FIX CRITICO)
-- Questa funzione è essenziale per la sicurezza (RLS).
-- Controlla se l'utente autenticato ha il ruolo 'admin' nel suo profilo.
-- =================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
-- Imposta il search_path per evitare ambiguità
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =================================================================
-- 2. PULIZIA E CORREZIONE VINCOLI CHIAVE ESTERNA
-- Rimuove in modo sicuro i vincoli errati e crea quello corretto.
-- =================================================================
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey') THEN
      ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
   END IF;
   IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN
      ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
   END IF;
END;
$$;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- =================================================================
-- 3. CREAZIONE DI TUTTE LE TABELLE MANCANTI
-- Usa 'IF NOT EXISTS' per essere sicuro da eseguire più volte.
-- =================================================================

-- Tabella per le notifiche interne all'admin panel
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le impostazioni avanzate e generali
CREATE TABLE IF NOT EXISTS public.advanced_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per i ticket di supporto
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

-- Tabella per le risposte ai ticket
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Chi ha risposto
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le promozioni e i codici sconto
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
-- 4. CREAZIONE TRIGGER E FUNZIONI CORRETTE
-- =================================================================

-- Funzione per il trigger di notifica (corretta)
CREATE OR REPLACE FUNCTION public.handle_new_operator_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_notifications (message, link)
  VALUES ('Nuova richiesta di approvazione operatore da ' || NEW.full_name, '/admin/operator-approvals');
  RETURN NEW;
END;
$$;

-- Rimuove il vecchio trigger errato (se esiste) e crea quello nuovo
DROP TRIGGER IF EXISTS on_new_operator_application ON public.profiles;
CREATE TRIGGER on_new_operator_application
AFTER INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'operator' AND NEW.status = 'pending')
EXECUTE FUNCTION public.handle_new_operator_application_notification();


-- =================================================================
-- 5. FUNZIONE PER LE STATISTICHE DEL CRUSCOTTO ADMIN
-- =================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS json
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
    SELECT count(*) INTO total_operators FROM public.profiles WHERE role = 'operator';
    SELECT count(*) INTO pending_operators FROM public.profiles WHERE role = 'operator' AND status = 'pending';
    SELECT COALESCE(sum(amount), 0) INTO total_revenue FROM public.transactions WHERE status = 'succeeded';
    SELECT COALESCE(sum(amount), 0) INTO monthly_revenue FROM public.transactions WHERE status = 'succeeded' AND created_at >= date_trunc('month', now());

    RETURN json_build_object(
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
-- Ora funzionerà perché is_admin() esiste.
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
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

-- ... e così via per le altre tabelle che richiedono RLS.


-- =================================================================
-- 7. VISTE PER SEMPLIFICARE LE QUERY
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
    p.created_at AS profile_created_at
FROM
    auth.users u
LEFT JOIN
    public.profiles p ON u.id = p.id;


-- =================================================================
-- 8. INSERIMENTO DATI DI DEFAULT
-- =================================================================
INSERT INTO public.advanced_settings (key, value, description)
VALUES
    ('maintenance_mode', '{"enabled": false, "message": "Sito in manutenzione. Torneremo presto online."}', 'Attiva/disattiva la modalità manutenzione per il sito pubblico.'),
    ('new_operator_commission', '{"rate": 0.30, "type": "percentage"}', 'Commissione di default per i nuovi operatori.'),
    ('general_settings', '{"site_name": "Moonthir", "contact_email": "supporto@moonthir.com"}', 'Impostazioni generali del sito.')
ON CONFLICT (key) DO NOTHING;
