-- Assicura che la tabella profiles esista con le colonne necessarie
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text,
    full_name text,
    avatar_url text,
    website text,
    role user_role NOT NULL DEFAULT 'client'::user_role,
    updated_at timestamp with time zone,
    CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);

-- Funzione per creare un profilo pubblico per i nuovi utenti
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'client' -- Tutti i nuovi utenti partono come 'client'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per eseguire la funzione dopo la creazione di un nuovo utente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Assicura che la tabella operators esista e sia collegata a profiles
CREATE TABLE IF NOT EXISTS public.operators (
    id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio text,
    specializations text[],
    cost_per_minute numeric(10, 2),
    availability_status operator_status DEFAULT 'offline'::operator_status,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Assicura che l'utente admin esista e abbia il ruolo corretto
-- Sostituisci con la tua vera email e password admin
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES ('YOUR_ADMIN_UUID', 'admin@moonthir.com', 'YOUR_ENCRYPTED_PASSWORD', 'authenticated', 'authenticated', 'YOUR_INSTANCE_ID', '{"provider":"email","providers":["email"]}', '{"provider":"email"}', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role)
VALUES ('YOUR_ADMIN_UUID', 'Admin', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
