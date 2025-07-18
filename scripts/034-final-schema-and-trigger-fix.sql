-- =================================================================
-- SCRIPT DI CORREZIONE E SETUP DEFINITIVO
-- Questo script consolida tutte le correzioni e prepara il database.
-- Eseguire questo script una sola volta.
-- =================================================================

-- =================================================================
-- 1. CORREZIONE VINCOLI CHIAVE ESTERNA (Fix per "column user_id does not exist")
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
-- 2. CREAZIONE TABELLE MANCANTI (se non esistono)
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

-- Popoliamo con impostazioni di default
INSERT INTO public.advanced_settings (key, value, description)
VALUES
    ('maintenance_mode', '{"enabled": false, "message": "Sito in manutenzione. Torneremo presto online."}', 'Attiva/disattiva la modalità manutenzione per il sito pubblico.'),
    ('new_operator_commission', '{"rate": 0.30, "type": "percentage"}', 'Commissione di default per i nuovi operatori.'),
    ('seo_defaults', '{"title": "Moonthir", "description": "Consulenza al minuto con i migliori esperti."}', 'Impostazioni SEO di default.'),
    ('general_settings', '{"site_name": "Moonthir", "contact_email": "supporto@moonthir.com"}', 'Impostazioni generali del sito.')
ON CONFLICT (key) DO NOTHING;

-- =================================================================
-- 3. CORREZIONE TRIGGER DI NOTIFICA (Fix per "syntax error at or near '||'")
-- =================================================================

-- Prima, creiamo una funzione TRIGGER corretta.
-- La logica di concatenazione stringa è DENTRO la funzione, dove è permessa.
CREATE OR REPLACE FUNCTION public.handle_new_operator_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserisce una notifica per l'admin
  INSERT INTO public.admin_notifications (message, link)
  VALUES ('Nuova richiesta di approvazione operatore da ' || NEW.full_name, '/admin/operator-approvals');
  RETURN NEW;
END;
$$;

-- Poi, rimuoviamo il vecchio trigger errato (se esiste)
DROP TRIGGER IF EXISTS on_new_operator_application ON public.profiles;

-- Infine, creiamo il nuovo trigger che usa la funzione corretta
CREATE TRIGGER on_new_operator_application
AFTER INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'operator' AND NEW.status = 'pending')
EXECUTE FUNCTION public.handle_new_operator_application_notification();


-- =================================================================
-- 4. APPLICAZIONE POLICY DI SICUREZZA (RLS)
-- =================================================================
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can access all notifications" ON public.admin_notifications;
CREATE POLICY "Admins can access all notifications" ON public.admin_notifications
FOR ALL USING (public.is_admin());

ALTER TABLE public.advanced_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage advanced settings" ON public.advanced_settings;
CREATE POLICY "Admins can manage advanced settings" ON public.advanced_settings
FOR ALL USING (public.is_admin());

-- =================================================================
-- 5. VISTE PER SEMPLIFICARE LE QUERY
-- =================================================================
CREATE OR REPLACE VIEW public.detailed_users AS
SELECT
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    p.full_name,
    p.role,
    p.status
FROM
    auth.users u
JOIN
    public.profiles p ON u.id = p.id;
