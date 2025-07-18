-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- TABELLA PROFILI (UTENTI, OPERATORI, ADMIN) - NON DISTRUTTIVA
-- =================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text UNIQUE,
    stage_name text UNIQUE,
    avatar_url text,
    phone text,
    bio text,
    role text NOT NULL DEFAULT 'client'::text,
    status text DEFAULT 'Attivo'::text, -- Attivo, Sospeso, In Attesa
    is_online boolean DEFAULT false,
    commission_rate numeric(5, 2),
    specialties text[],
    categories text[],
    availability jsonb,
    services jsonb,
    average_rating numeric(3, 2) DEFAULT 0.00,
    reviews_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- =================================================================
-- TABELLA CANDIDATURE OPERATORI - NON DISTRUTTIVA
-- =================================================================
CREATE TABLE IF NOT EXISTS public.operator_applications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text,
    bio text,
    specialties text[],
    categories text[],
    status text DEFAULT 'pending'::text, -- pending, approved, rejected
    rejection_reason text,
    submitted_at timestamp with time zone DEFAULT now()
);

-- =================================================================
-- FUNZIONE PER GESTIRE NUOVI UTENTI (Trigger su auth.users)
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'client')::text,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assicura che il trigger esista e sia corretto
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =================================================================
-- FUNZIONE RPC PER APPROVARE UNA CANDIDATURA
-- =================================================================
CREATE OR REPLACE FUNCTION public.approve_operator(p_application_id uuid)
RETURNS json AS $$
DECLARE
  application record;
  new_user_id uuid;
  temp_password text;
  final_stage_name text;
BEGIN
  -- 1. Trova la candidatura
  SELECT * INTO application FROM public.operator_applications WHERE id = p_application_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidatura non trovata o già processata.';
  END IF;

  -- 2. Genera password temporanea
  temp_password := substr(md5(random()::text), 0, 12);
  
  -- 3. Crea lo stage_name, assicurandosi che sia unico
  final_stage_name := regexp_replace(lower(application.full_name), '[^a-z0-9]+', '', 'g');
  IF EXISTS (SELECT 1 FROM public.profiles WHERE stage_name = final_stage_name) THEN
    final_stage_name := final_stage_name || '_' || substr(p_application_id::text, 1, 4);
  END IF;

  -- 4. Crea l'utente in auth.users usando la funzione admin
  SELECT id INTO new_user_id FROM auth.users WHERE email = application.email;
  IF new_user_id IS NULL THEN
     -- Crea un nuovo utente auth
     new_user_id := (select auth.admin_create_user(application.email, temp_password, '{"role": "operator", "full_name": "application.full_name"}')).id;
  END IF;

  -- 5. Il trigger 'handle_new_user' ha creato un profilo base. Ora lo aggiorniamo.
  UPDATE public.profiles
  SET
    full_name = application.full_name,
    phone = application.phone,
    bio = application.bio,
    specialties = application.specialties,
    categories = application.categories,
    role = 'operator',
    status = 'Attivo',
    stage_name = final_stage_name
  WHERE id = new_user_id;

  -- 6. Aggiorna lo stato della candidatura
  UPDATE public.operator_applications SET status = 'approved' WHERE id = p_application_id;

  -- 7. Ritorna successo e password
  RETURN json_build_object('success', true, 'user_id', new_user_id, 'temp_password', temp_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
