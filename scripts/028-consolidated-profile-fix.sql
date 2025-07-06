-- =================================================================
-- SCRIPT DI CONSOLIDAMENTO E CORREZIONE PROFILI
-- Versione: 1.0
-- Obiettivo: Garantire che la tabella 'profiles' abbia TUTTE le
--            colonne necessarie per gli operatori, risolvendo
--            errori di colonne mancanti come 'status'.
-- Sicurezza: Utilizza 'IF NOT EXISTS' per essere eseguibile più volte.
-- =================================================================

-- STEP 1: Aggiungere tutte le colonne potenzialmente mancanti alla tabella 'profiles'.
-- Questo approccio consolidato previene errori futuri.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS stage_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client',
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS main_discipline TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS service_prices JSONB,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB,
ADD COLUMN IF NOT EXISTS specialties TEXT[]; -- Aggiungo anche le specialità come array di testo

-- Aggiunta di commenti per chiarezza
COMMENT ON COLUMN public.profiles.status IS 'Stato dell''account operatore (es. active, pending, suspended).';
COMMENT ON COLUMN public.profiles.service_prices IS 'Oggetto JSON con i prezzi per servizio (chat, call, email).';
COMMENT ON COLUMN public.profiles.specialties IS 'Array di stringhe per i tag/specialità dell''operatore.';

-- STEP 2: Ricreare la vista di amministrazione per assicurarsi che sia aggiornata.
-- L'eliminazione e ricreazione garantisce che la vista rifletta lo schema corrente.
DROP VIEW IF EXISTS public.admin_operators_view;

CREATE OR REPLACE VIEW public.admin_operators_view AS
SELECT
  p.id,
  p.full_name,
  p.stage_name,
  p.main_discipline,
  p.status,
  p.commission_rate,
  p.created_at AS joined_at,
  u.email,
  p.phone,
  p.bio,
  p.is_available,
  p.profile_image_url,
  p.service_prices,
  p.availability_schedule,
  p.specialties
FROM
  public.profiles p
JOIN
  auth.users u ON p.id = u.id
WHERE
  p.role = 'operator';

COMMENT ON VIEW public.admin_operators_view IS 'Vista aggregata e corretta per recuperare tutti i dati degli operatori per il pannello di amministrazione.';

-- Notifica di completamento
SELECT 'Script 028-consolidated-profile-fix.sql eseguito con successo. Lo schema dei profili è ora completo.' as result;
