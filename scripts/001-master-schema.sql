-- =================================================================
-- MASTER SCHEMA SCRIPT
-- Descrizione: Resetta e ricrea l'intero schema dell'applicazione.
-- Eseguire questo script per garantire uno stato pulito e corretto.
-- =================================================================

-- Fase 1: Pulizia Completa in Ordine Inverso di Dipendenza
-- Usiamo CASCADE per rimuovere oggetti dipendenti senza errori.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.approve_operator_application(uuid, uuid);
DROP FUNCTION IF EXISTS public.reject_operator_application(uuid);
DROP TABLE IF EXISTS public.operator_applications;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.application_status;

-- Fase 2: Creazione dei Tipi Enumerati
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Fase 3: Creazione della Tabella Profili
-- Questa tabella conterrà i dati pubblici degli utenti.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255), -- L'email viene copiata qui per un accesso più semplice
  role user_role NOT NULL DEFAULT 'client',
  wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  -- Campi specifici per l'operatore
  stage_name VARCHAR(255),
  bio TEXT,
  specializations TEXT[],
  profile_image_url VARCHAR(255),
  hourly_rate NUMERIC(10, 2),
  is_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Dati pubblici e di ruolo per tutti gli utenti.';

-- Fase 4: Funzione e Trigger per la Creazione Automatica del Profilo
-- Questa funzione viene eseguita ogni volta che un nuovo utente si registra.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    'client' -- Tutti i nuovi utenti partono come 'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Il trigger che invoca la funzione handle_new_user.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fase 5: Creazione della Tabella per le Candidature degli Operatori
CREATE TABLE public.operator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  phone VARCHAR(50) NOT NULL,
  bio TEXT NOT NULL,
  specializations TEXT[] NOT NULL,
  cv_url VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.operator_applications IS 'Registra le richieste degli utenti per diventare operatori.';

-- Indice per assicurare che un utente possa avere una sola candidatura pendente.
CREATE UNIQUE INDEX unique_pending_application_idx ON public.operator_applications (user_id) WHERE (status = 'pending');

-- Fase 6: Funzioni del Database per la Logica di Approvazione (RPC)
-- Funzione per approvare una candidatura.
CREATE OR REPLACE FUNCTION public.approve_operator_application(p_application_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Aggiorna lo stato della candidatura a 'approved'
  UPDATE public.operator_applications
  SET status = 'approved', updated_at = NOW()
  WHERE id = p_application_id;

  -- Aggiorna il ruolo dell'utente a 'operator' nella tabella dei profili
  UPDATE public.profiles
  SET role = 'operator', updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per rifiutare una candidatura.
CREATE OR REPLACE FUNCTION public.reject_operator_application(p_application_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Aggiorna lo stato della candidatura a 'rejected'
  UPDATE public.operator_applications
  SET status = 'rejected', updated_at = NOW()
  WHERE id = p_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fase 7: Abilitazione della Row Level Security (RLS)
-- Protegge i dati assicurando che gli utenti possano accedere solo a ciò che è loro permesso.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gli utenti possono vedere tutti i profili pubblici" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Gli utenti possono aggiornare il proprio profilo" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.operator_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gli utenti possono vedere la propria candidatura" ON public.operator_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gli utenti possono creare la propria candidatura" ON public.operator_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Gli admin bypassano RLS perché usano la service_role_key.

-- Fine dello script.
