-- =================================================================
-- 1. PULIZIA E CORREZIONE DEI VINCOLI ERRATI
-- Rimuove i vincoli di chiave esterna che puntavano a colonne inesistenti o erano nominati in modo errato.
-- Questo è il FIX CRITICO per l'errore "column user_id does not exist".
-- =================================================================

-- Correzione per la tabella 'profiles': il vincolo deve essere sulla colonna 'id'.
DO $$
BEGIN
   -- Rimuove il vincolo errato se esiste
   IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey') THEN
      ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
   END IF;
   -- Rimuove il vincolo corretto (se già esistente con un nome diverso) per ricrearlo in modo pulito
   IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN
      ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
   END IF;
END;
$$;

-- Aggiunge il vincolo CORRETTO: la colonna 'id' di 'profiles' referenzia 'auth.users.id'
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- =================================================================
-- 2. CREAZIONE TABELLE MANCANTI PER LE NUOVE FUNZIONALITÀ
-- Aggiunge le tabelle per Notifiche (Punto 11) e Impostazioni Avanzate (Punto 15).
-- =================================================================

-- Tabella per le Notifiche dell'Admin (Punto 11)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    link TEXT, -- Link opzionale per reindirizzare l'admin (es. a una nuova approvazione)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le Impostazioni Avanzate (Punto 15)
CREATE TABLE IF NOT EXISTS public.advanced_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Popoliamo con alcune impostazioni di default se la tabella è nuova
INSERT INTO public.advanced_settings (key, value, description)
VALUES
    ('maintenance_mode', '{"enabled": false, "message": "Sito in manutenzione. Torneremo presto online."}', 'Attiva/disattiva la modalità manutenzione per il sito pubblico.'),
    ('new_operator_commission', '{"rate": 0.30, "type": "percentage"}', 'Commissione di default per i nuovi operatori.'),
    ('seo_defaults', '{"title": "Moonthir", "description": "Consulenza al minuto con i migliori esperti."}', 'Impostazioni SEO di default per le pagine senza metadati specifici.')
ON CONFLICT (key) DO NOTHING;


-- =================================================================
-- 3. VERIFICA E APPLICAZIONE POLICY DI SICUREZZA (RLS)
-- Assicura che tutte le tabelle, nuove e vecchie, siano protette da RLS.
-- =================================================================

-- Policy per le notifiche admin: solo gli admin possono vederle
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can access all notifications" ON public.admin_notifications;
CREATE POLICY "Admins can access all notifications" ON public.admin_notifications
FOR ALL USING (public.is_admin());

-- Policy per le impostazioni avanzate: solo gli admin possono gestirle
ALTER TABLE public.advanced_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage advanced settings" ON public.advanced_settings;
CREATE POLICY "Admins can manage advanced settings" ON public.advanced_settings
FOR ALL USING (public.is_admin());

-- Riapplica le policy su tabelle esistenti per sicurezza
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- 4. FUNZIONE PER CREARE NOTIFICHE ADMIN
-- Una funzione helper da usare in altri trigger per notificare l'admin.
-- =================================================================
CREATE OR REPLACE FUNCTION public.create_admin_notification(message TEXT, link TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_notifications (message, link)
  VALUES (message, link);
END;
$$;

-- Esempio di trigger: notifica l'admin quando un nuovo operatore si registra
DROP TRIGGER IF EXISTS on_new_operator_application ON public.profiles;
CREATE TRIGGER on_new_operator_application
AFTER INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'operator' AND NEW.status = 'pending')
EXECUTE FUNCTION public.create_admin_notification(
  'Nuova richiesta di approvazione operatore da ' || NEW.full_name,
  '/admin/operator-approvals'
);
