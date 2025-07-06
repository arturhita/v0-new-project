-- =================================================================
-- SCRIPT CONSOLIDATO PER LO SCHEMA DEGLI OPERATORI
-- Versione: 1.0
-- Obiettivo: Garantire che la tabella 'profiles' abbia tutte le
--            colonne necessarie per gli operatori e creare una
--            vista di amministrazione stabile.
-- Sicurezza: Utilizza 'IF NOT EXISTS' per essere eseguibile più volte.
-- =================================================================

-- STEP 1: Assicurarsi che tutte le colonne necessarie esistano nella tabella 'profiles'.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS main_discipline TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS service_prices JSONB,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB;

-- Aggiunta di commenti per chiarezza futura
COMMENT ON COLUMN public.profiles.commission_rate IS 'La percentuale di commissione per l''operatore (es. 15.00 per 15%).';
COMMENT ON COLUMN public.profiles.phone IS 'Numero di telefono dell''operatore (privato).';
COMMENT ON COLUMN public.profiles.main_discipline IS 'La disciplina principale mostrata in elenchi rapidi.';
COMMENT ON COLUMN public.profiles.status IS 'Stato dell''account operatore (es. active, pending, suspended).';
COMMENT ON COLUMN public.profiles.service_prices IS 'Oggetto JSON con i prezzi per servizio (chat, call, email).';
COMMENT ON COLUMN public.profiles.availability_schedule IS 'Oggetto JSON con la pianificazione della disponibilità settimanale.';


-- STEP 2: Eliminare la vista di amministrazione se esiste, per garantirne una ricreazione pulita.
DROP VIEW IF EXISTS public.admin_operators_view;


-- STEP 3: Creare la vista di amministrazione che include TUTTE le colonne necessarie.
-- Questa vista unisce i profili con gli utenti per ottenere l'email e altri dati.
CREATE VIEW public.admin_operators_view AS
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
  p.availability_schedule
FROM
  public.profiles p
JOIN
  auth.users u ON p.id = u.id
WHERE
  p.role = 'operator';

COMMENT ON VIEW public.admin_operators_view IS 'Vista aggregata per recuperare facilmente tutti i dati degli operatori per il pannello di amministrazione.';

-- Notifica di completamento
SELECT 'Script 023-consolidated-operator-schema.sql eseguito con successo.' as result;
