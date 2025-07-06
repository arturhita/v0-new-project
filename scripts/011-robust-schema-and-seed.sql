-- Questo script è progettato per essere eseguito più volte senza errori.
-- Corregge lo schema, pulisce le tabelle correlate e popola il database in modo robusto.

-- Inizia una transazione per garantire che tutte le operazioni abbiano successo o falliscano insieme.
BEGIN;

-- == SEZIONE 1: Migrazione dello schema 'profiles' ==
-- Aggiunge la colonna 'full_name' se non esiste.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Se le vecchie colonne 'name' e 'surname' esistono, unisce i loro valori in 'full_name' e poi le elimina.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name')
  AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'surname') THEN
    UPDATE public.profiles SET full_name = name || ' ' || surname WHERE full_name IS NULL;
    ALTER TABLE public.profiles DROP COLUMN name, DROP COLUMN surname;
  END IF;
END $$;

-- Rimuove la vecchia colonna 'specializations' se esiste.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'specializations') THEN
    ALTER TABLE public.profiles DROP COLUMN specializations;
  END IF;
END $$;


-- == SEZIONE 2: Pulizia e Ricostruzione delle Tabelle Correlate ==
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.operator_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
);
CREATE TABLE public.operator_categories (
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, category_id)
);
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- == SEZIONE 3: Impostazione delle Policy di Sicurezza (RLS) ==
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read access to operator_categories" ON public.operator_categories;
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;

CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to operator_categories" ON public.operator_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);


-- == SEZIONE 4: Popolamento del Database (Seeding) - VERSIONE ROBUSTA ==
-- Inserisce le categorie di esempio.
INSERT INTO public.categories (name, slug, description) VALUES
('Tarocchi', 'tarocchi', 'Lettura e interpretazione dei tarocchi per guida e introspezione.'),
('Astrologia', 'astrologia', 'Analisi del tema natale e transiti planetari per comprendere il percorso di vita.'),
('Cartomanzia', 'cartomanzia', 'Lettura delle carte per predire eventi futuri e offrire consigli.'),
('Rune', 'rune', 'Interpretazione delle antiche rune norrene per saggezza e divinazione.')
ON CONFLICT (slug) DO NOTHING;

-- Inserisce utenti e profili di esempio in modo robusto.
DO $$
DECLARE
  client_1_id UUID;
  client_2_id UUID;
  operator_1_id UUID;
  operator_2_id UUID;
  cat_tarocchi_id UUID;
  cat_astrologia_id UUID;
BEGIN
  -- Ottiene gli ID delle categorie
  SELECT id INTO cat_tarocchi_id FROM public.categories WHERE slug = 'tarocchi';
  SELECT id INTO cat_astrologia_id FROM public.categories WHERE slug = 'astrologia';

  -- Crea Cliente 1 se non esiste
  SELECT id INTO client_1_id FROM auth.users WHERE email = 'mario.rossi.cliente@example.com';
  IF client_1_id IS NULL THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'mario.rossi.cliente@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
    RETURNING id INTO client_1_id;
    INSERT INTO public.profiles (id, full_name, email, role) VALUES (client_1_id, 'Mario Rossi', 'mario.rossi.cliente@example.com', 'client');
  END IF;

  -- Crea Cliente 2 se non esiste
  SELECT id INTO client_2_id FROM auth.users WHERE email = 'laura.bianchi.cliente@example.com';
  IF client_2_id IS NULL THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'laura.bianchi.cliente@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
    RETURNING id INTO client_2_id;
    INSERT INTO public.profiles (id, full_name, email, role) VALUES (client_2_id, 'Laura Bianchi', 'laura.bianchi.cliente@example.com', 'client');
  END IF;

  -- Crea Operatore 1 (Luce) se non esiste
  SELECT id INTO operator_1_id FROM auth.users WHERE email = 'luce.operatore@example.com';
  IF operator_1_id IS NULL THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'luce.operatore@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
    RETURNING id INTO operator_1_id;
    INSERT INTO public.profiles (id, full_name, stage_name, email, role, bio, is_available, profile_image_url, average_rating, review_count)
    VALUES (operator_1_id, 'Chiara Verdi', 'Luce', 'luce.operatore@example.com', 'operator', 'Interpreto i tarocchi da oltre 15 anni, offrendo una guida chiara e compassionevole per illuminare il tuo cammino.', true, '/placeholder.svg?width=128&height=128', 4.8, 120);
  END IF;

  -- Crea Operatore 2 (Cosmo) se non esiste
  SELECT id INTO operator_2_id FROM auth.users WHERE email = 'cosmo.operatore@example.com';
  IF operator_2_id IS NULL THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'cosmo.operatore@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
    RETURNING id INTO operator_2_id;
    INSERT INTO public.profiles (id, full_name, stage_name, email, role, bio, is_available, profile_image_url, average_rating, review_count)
    VALUES (operator_2_id, 'Marco Neri', 'Cosmo', 'cosmo.operatore@example.com', 'operator', 'Astrologo professionista, specializzato in temi natali e astrologia karmica. Scopri il disegno delle stelle sulla tua vita.', false, '/placeholder.svg?width=128&height=128', 4.9, 95);
  END IF;

  -- Pulisce le associazioni e le recensioni esistenti per evitare duplicati
  DELETE FROM public.operator_categories;
  DELETE FROM public.reviews;

  -- Associa gli operatori alle categorie
  INSERT INTO public.operator_categories (operator_id, category_id) VALUES
  (operator_1_id, cat_tarocchi_id),
  (operator_2_id, cat_astrologia_id);

  -- Inserisce recensioni di esempio
  INSERT INTO public.reviews (operator_id, client_id, rating, comment, created_at) VALUES
  (operator_1_id, client_1_id, 5, 'Luce è stata incredibilmente precisa e gentile. La sua lettura mi ha dato la chiarezza che cercavo. Consigliatissima!', NOW() - INTERVAL '2 days'),
  (operator_1_id, client_2_id, 4, 'Una buona lettura, molto professionale. Mi ha dato spunti interessanti su cui riflettere.', NOW() - INTERVAL '5 days'),
  (operator_2_id, client_1_id, 5, 'Cosmo è un vero esperto. La sua analisi del mio tema natale è stata profonda e illuminante. Un professionista eccezionale.', NOW() - INTERVAL '1 day');

END $$;

-- Conclude la transazione.
COMMIT;
