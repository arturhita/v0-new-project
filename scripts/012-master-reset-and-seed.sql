-- =================================================================
-- == SCRIPT DI RESET E SEED COMPLETO PER MOONTHIR ==
-- ATTENZIONE: Questo script cancellerà e ricreerà dati di esempio.
-- Eseguire solo su un ambiente di sviluppo.
-- =================================================================

-- Inizia una transazione per garantire l'atomicità dell'operazione.
BEGIN;

-- == FASE 1: PULIZIA PROFONDA ==
-- Elimina gli utenti di esempio dalla tabella di autenticazione di Supabase.
-- Questo è il passaggio chiave per risolvere gli errori di "chiave duplicata".
DELETE FROM auth.users WHERE email IN (
  'mario.rossi.cliente@example.com',
  'laura.bianchi.cliente@example.com',
  'luce.operatore@example.com',
  'cosmo.operatore@example.com'
);

-- Elimina le tabelle pubbliche in ordine inverso per rispettare le dipendenze.
-- CASCADE assicura che vengano eliminate anche le dipendenze (es. foreign keys).
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.operator_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
-- Nota: non eliminiamo la tabella 'profiles' perché è legata a 'auth.users',
-- ma la migreremo e puliremo.

-- == FASE 2: MIGRAZIONE E RICOSTRUZIONE DELLO SCHEMA ==

-- Migrazione della tabella 'profiles' per assicurare la presenza di 'full_name'.
DO $$
BEGIN
  -- Aggiunge la colonna 'full_name' se non esiste.
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
  -- Rimuove le vecchie colonne 'name' e 'surname' se esistono.
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name') THEN
    ALTER TABLE public.profiles DROP COLUMN name;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'surname') THEN
    ALTER TABLE public.profiles DROP COLUMN surname;
  END IF;
END $$;

-- Creazione della tabella 'categories'.
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Creazione della tabella di collegamento 'operator_categories'.
CREATE TABLE public.operator_categories (
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, category_id)
);

-- Creazione della tabella 'reviews'.
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- == FASE 3: IMPOSTAZIONE DELLE POLICY DI SICUREZZA (RLS) ==
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.operator_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to operator_categories" ON public.operator_categories FOR SELECT USING (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);


-- == FASE 4: POPOLAMENTO DEL DATABASE (SEEDING) ==
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

  -- Crea e inserisce Cliente 1.
  INSERT INTO auth.users (instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mario.rossi.cliente@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Mario Rossi'), NOW(), NOW())
  RETURNING id INTO client_1_id;
  INSERT INTO public.profiles (id, full_name, email, role) VALUES (client_1_id, 'Mario Rossi', 'mario.rossi.cliente@example.com', 'client');

  -- Crea e inserisce Cliente 2.
  INSERT INTO auth.users (instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'laura.bianchi.cliente@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Laura Bianchi'), NOW(), NOW())
  RETURNING id INTO client_2_id;
  INSERT INTO public.profiles (id, full_name, email, role) VALUES (client_2_id, 'Laura Bianchi', 'laura.bianchi.cliente@example.com', 'client');

  -- Crea e inserisce Operatore 1 (Luce).
  INSERT INTO auth.users (instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'luce.operatore@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Chiara Verdi'), NOW(), NOW())
  RETURNING id INTO operator_1_id;
  INSERT INTO public.profiles (id, full_name, stage_name, email, role, bio, is_available, profile_image_url, average_rating, review_count)
  VALUES (operator_1_id, 'Chiara Verdi', 'Luce', 'luce.operatore@example.com', 'operator', 'Interpreto i tarocchi da oltre 15 anni, offrendo una guida chiara e compassionevole per illuminare il tuo cammino.', true, '/placeholder.svg?width=128&height=128', 4.8, 120);

  -- Crea e inserisce Operatore 2 (Cosmo).
  INSERT INTO auth.users (instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cosmo.operatore@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Marco Neri'), NOW(), NOW())
  RETURNING id INTO operator_2_id;
  INSERT INTO public.profiles (id, full_name, stage_name, email, role, bio, is_available, profile_image_url, average_rating, review_count)
  VALUES (operator_2_id, 'Marco Neri', 'Cosmo', 'cosmo.operatore@example.com', 'operator', 'Astrologo professionista, specializzato in temi natali e astrologia karmica. Scopri il disegno delle stelle sulla tua vita.', false, '/placeholder.svg?width=128&height=128', 4.9, 95);

  -- Associa gli operatori alle categorie.
  INSERT INTO public.operator_categories (operator_id, category_id) VALUES
  (operator_1_id, cat_tarocchi_id),
  (operator_2_id, cat_astrologia_id);

  -- Inserisce recensioni di esempio.
  INSERT INTO public.reviews (operator_id, client_id, rating, comment, created_at) VALUES
  (operator_1_id, client_1_id, 5, 'Luce è stata incredibilmente precisa e gentile. La sua lettura mi ha dato la chiarezza che cercavo. Consigliatissima!', NOW() - INTERVAL '2 days'),
  (operator_1_id, client_2_id, 4, 'Una buona lettura, molto professionale. Mi ha dato spunti interessanti su cui riflettere.', NOW() - INTERVAL '5 days'),
  (operator_2_id, client_1_id, 5, 'Cosmo è un vero esperto. La sua analisi del mio tema natale è stata profonda e illuminante. Un professionista eccezionale.', NOW() - INTERVAL '1 day');
END $$;

-- Conclude la transazione.
COMMIT;
