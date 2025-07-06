-- =================================================================
-- == SCRIPT DI RESET DEFINITIVO E FINALE PER MOONTHIR ==
-- OBIETTIVO: Risolvere TUTTI gli errori, inclusi quelli dei trigger nascosti.
-- AZIONI:
-- 1. CANCELLA il vecchio trigger 'handle_new_user' che causa l'errore.
-- 2. CANCELLA tutti i dati di esempio e le tabelle pubbliche.
-- 3. RICOSTRUISCE lo schema del database da zero in modo corretto.
-- 4. CREA un nuovo trigger 'handle_new_user' corretto.
-- 5. POPOLA il database con dati di esempio in modo sicuro.
-- =================================================================

BEGIN;

-- == FASE 1: PULIZIA TOTALE E DEFINITIVA ==

-- **PASSAGGIO CHIAVE: Rimuovere il vecchio trigger e la funzione che causano l'errore.**
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Elimina gli utenti di esempio per garantire una pulizia completa.
DELETE FROM auth.users WHERE email IN (
  'mario.rossi.cliente@example.com',
  'laura.bianchi.cliente@example.com',
  'luce.operatore@example.com',
  'cosmo.operatore@example.com'
);

-- Elimina le tabelle pubbliche.
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.operator_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- == FASE 2: RICOSTRUZIONE DELLO SCHEMA CORRETTO ==

-- Tabella 'profiles' con la colonna 'full_name'.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    stage_name TEXT UNIQUE,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'client',
    bio TEXT,
    is_available BOOLEAN DEFAULT false,
    profile_image_url TEXT,
    average_rating NUMERIC(2, 1),
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_auth_users FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabella 'categories'.
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Tabella di collegamento 'operator_categories'.
CREATE TABLE public.operator_categories (
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, category_id)
);

-- Tabella 'reviews'.
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- == FASE 3: CREAZIONE DEL NUOVO TRIGGER CORRETTO ==

-- Questa funzione si attiverà ogni volta che un nuovo utente si registra.
-- **Usa 'full_name' e legge da 'raw_user_meta_data', che è la best practice.**
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'client');
  RETURN new;
END;
$$;

-- Applica il trigger alla tabella auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- == FASE 4: IMPOSTAZIONE DELLE POLICY DI SICUREZZA (RLS) ==
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.operator_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to operator_categories" ON public.operator_categories FOR SELECT USING (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);


-- == FASE 5: POPOLAMENTO SICURO DEL DATABASE (SEEDING) ==
-- Questo blocco ora funzionerà perché il trigger 'handle_new_user' è corretto.
DO $$
DECLARE
  client_1_id UUID;
  client_2_id UUID;
  operator_1_id UUID;
  operator_2_id UUID;
  cat_tarocchi_id UUID;
  cat_astrologia_id UUID;
BEGIN
  -- Inserisce le categorie.
  INSERT INTO public.categories (name, slug, description) VALUES
  ('Tarocchi', 'tarocchi', 'Lettura e interpretazione dei tarocchi per guida e introspezione.'),
  ('Astrologia', 'astrologia', 'Analisi del tema natale e transiti planetari per comprendere il percorso di vita.')
  ON CONFLICT (slug) DO NOTHING;

  -- Ottiene gli ID delle categorie.
  SELECT id INTO cat_tarocchi_id FROM public.categories WHERE slug = 'tarocchi';
  SELECT id INTO cat_astrologia_id FROM public.categories WHERE slug = 'astrologia';

  -- Crea Cliente 1. Il trigger 'handle_new_user' creerà il profilo corrispondente.
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'mario.rossi.cliente@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Mario Rossi'))
  RETURNING id INTO client_1_id;

  -- Crea Cliente 2.
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'laura.bianchi.cliente@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Laura Bianchi'))
  RETURNING id INTO client_2_id;

  -- Crea Operatore 1 (Luce).
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'luce.operatore@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Chiara Verdi'))
  RETURNING id INTO operator_1_id;
  -- Aggiorna il profilo di Luce per renderla un operatore.
  UPDATE public.profiles
  SET
    role = 'operator',
    stage_name = 'Luce',
    bio = 'Interpreto i tarocchi da oltre 15 anni, offrendo una guida chiara e compassionevole per illuminare il tuo cammino.',
    is_available = true,
    profile_image_url = '/placeholder.svg?width=128&height=128',
    average_rating = 4.8,
    review_count = 120
  WHERE id = operator_1_id;

  -- Crea Operatore 2 (Cosmo).
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'cosmo.operatore@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Marco Neri'))
  RETURNING id INTO operator_2_id;
  -- Aggiorna il profilo di Cosmo per renderlo un operatore.
  UPDATE public.profiles
  SET
    role = 'operator',
    stage_name = 'Cosmo',
    bio = 'Astrologo professionista, specializzato in temi natali e astrologia karmica. Scopri il disegno delle stelle sulla tua vita.',
    is_available = false,
    profile_image_url = '/placeholder.svg?width=128&height=128',
    average_rating = 4.9,
    review_count = 95
  WHERE id = operator_2_id;

  -- Associa gli operatori alle categorie.
  INSERT INTO public.operator_categories (operator_id, category_id) VALUES
  (operator_1_id, cat_tarocchi_id),
  (operator_2_id, cat_astrologia_id);

  -- Inserisce recensioni di esempio.
  INSERT INTO public.reviews (operator_id, client_id, rating, comment) VALUES
  (operator_1_id, client_1_id, 5, 'Luce è stata incredibilmente precisa e gentile. La sua lettura mi ha dato la chiarezza che cercavo. Consigliatissima!'),
  (operator_1_id, client_2_id, 4, 'Una buona lettura, molto professionale. Mi ha dato spunti interessanti su cui riflettere.'),
  (operator_2_id, client_1_id, 5, 'Cosmo è un vero esperto. La sua analisi del mio tema natale è stata profonda e illuminante. Un professionista eccezionale.');
END $$;

COMMIT;
