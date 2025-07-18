-- Questo script è progettato per essere eseguito più volte senza errori.
-- Pulisce e ricrea le funzioni e le policy per garantire uno stato corretto.

-- 1. Funzione per le statistiche della dashboard
-- Prima la eliminiamo se esiste, per evitare l'errore "cannot change return type"
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();

-- Poi la ricreiamo con la struttura corretta
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, pending_operators bigint, total_revenue numeric, monthly_revenue numeric)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM auth.users WHERE raw_app_meta_data->>'role' = 'client') AS total_users,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'approved') AS total_operators,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'pending') AS pending_operators,
    (SELECT sum(amount) FROM public.transactions WHERE type = 'charge') AS total_revenue,
    (SELECT sum(amount) FROM public.transactions WHERE type = 'charge' AND created_at >= date_trunc('month', now())) AS monthly_revenue;
END;
$$;

-- 2. Tabella per le richieste di aumento commissione
CREATE TABLE IF NOT EXISTS public.commission_increase_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_rate numeric(5, 2) NOT NULL,
    requested_rate numeric(5, 2) NOT NULL,
    reason text,
    status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz
);

-- 3. Tabella per le promozioni globali (struttura corretta)
DROP TABLE IF EXISTS public.promotions CASCADE;
CREATE TABLE public.promotions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    special_price numeric(10, 2),
    discount_percentage integer,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_discount_type CHECK (
        (special_price IS NOT NULL AND discount_percentage IS NULL) OR
        (special_price IS NULL AND discount_percentage IS NOT NULL)
    )
);

-- 4. Tabella per le notifiche broadcast
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    target_role text NOT NULL, -- 'all', 'client', 'operator'
    sent_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Funzione per inviare notifiche broadcast
CREATE OR REPLACE FUNCTION public.send_broadcast_notification(p_title text, p_message text, p_target_role text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  target_user RECORD;
BEGIN
  -- Log the broadcast itself
  INSERT INTO public.broadcast_notifications (title, message, target_role)
  VALUES (p_title, p_message, p_target_role);

  -- Create individual notifications for each user
  FOR target_user IN
    SELECT id FROM auth.users
    WHERE
      (p_target_role = 'all') OR
      (p_target_role = 'client' AND raw_app_meta_data->>'role' = 'client') OR
      (p_target_role = 'operator' AND raw_app_meta_data->>'role' = 'operator')
  LOOP
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (target_user.id, p_title, p_message);
  END LOOP;
END;
$$;


-- 6. Tabella per le impostazioni avanzate
CREATE TABLE IF NOT EXISTS public.advanced_settings (
    key text PRIMARY KEY,
    value jsonb,
    description text,
    type text -- 'financial', 'system', etc.
);

-- Inserisci le impostazioni finanziarie solo se non esistono
INSERT INTO public.advanced_settings (key, value, description, type)
VALUES
    ('platform_fee_percentage', '{"value": 20}', 'Commissione standard della piattaforma (%)', 'financial'),
    ('call_transfer_fee_client', '{"value": 0.50}', 'Costo trasferimento chiamata per il cliente (€)', 'financial'),
    ('call_transfer_fee_operator', '{"value": 0.20}', 'Costo trasferimento chiamata per operatore (€)', 'financial')
ON CONFLICT (key) DO NOTHING;


-- 7. Correzione delle Policy di Sicurezza (RLS)
-- Abilita RLS se non è già abilitato
ALTER TABLE public.commission_increase_requests ENABLE ROW LEVEL SECURITY;

-- Elimina le policy esistenti prima di ricrearle per evitare errori
DROP POLICY IF EXISTS "Operators can create their own requests" ON public.commission_increase_requests;
DROP POLICY IF EXISTS "Admins can manage all commission requests" ON public.commission_increase_requests;

-- Ricrea le policy con la sintassi e la logica corrette
-- Correzione: usa `(SELECT role FROM public.profiles WHERE id = operator_id) = 'operator'` e `auth.uid()`
CREATE POLICY "Operators can create their own requests"
ON public.commission_increase_requests
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = operator_id) = 'operator' AND
  (SELECT user_id FROM public.profiles WHERE id = operator_id) = auth.uid()
);

CREATE POLICY "Admins can manage all commission requests"
ON public.commission_increase_requests
FOR ALL
USING (is_admin(auth.uid()));

-- Assicura che la relazione per i pagamenti sia corretta
-- La tabella `payout_requests` deve avere un `operator_id` che referenzia `profiles(id)`
-- Questo viene gestito nella definizione della tabella, ma lo script assicura che sia tutto a posto.
-- Se la colonna `operator_id` non esiste, la aggiungiamo.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'operator_id'
  ) THEN
    ALTER TABLE public.payout_requests ADD COLUMN operator_id uuid REFERENCES public.profiles(id);
  END IF;
END $$;
