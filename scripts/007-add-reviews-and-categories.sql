-- 1. Tabella Categorie
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.categories IS 'Memorizza le categorie di specializzazione degli operatori.';

-- 2. Tabella di collegamento Operatori-Categorie (Molti-a-Molti)
CREATE TABLE IF NOT EXISTS public.operator_categories (
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, category_id)
);
COMMENT ON TABLE public.operator_categories IS 'Collega gli operatori alle loro categorie di specializzazione.';

-- 3. Tabella Recensioni
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT TRUE
);
COMMENT ON TABLE public.reviews IS 'Memorizza le recensioni lasciate dai clienti per gli operatori.';

-- 4. Abilitare RLS (Row Level Security)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Funzione di utilità is_admin (se non esiste già)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Policies RLS
-- Rimuovi le vecchie policy se esistono per ricrearle
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read access to operator_categories" ON public.operator_categories;
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow authenticated users to create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow users to update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin full access to operator_categories" ON public.operator_categories;
DROP POLICY IF EXISTS "Allow admin full access to reviews" ON public.reviews;


-- Chiunque può leggere categorie e le associazioni con gli operatori
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to operator_categories" ON public.operator_categories FOR SELECT USING (true);

-- Chiunque può leggere le recensioni
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);

-- Gli utenti autenticati possono creare recensioni
CREATE POLICY "Allow authenticated users to create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Gli utenti possono aggiornare solo le proprie recensioni
CREATE POLICY "Allow users to update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = client_id);

-- Gli admin possono fare tutto
CREATE POLICY "Allow admin full access to categories" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access to operator_categories" ON public.operator_categories FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access to reviews" ON public.reviews FOR ALL USING (public.is_admin(auth.uid()));


-- Modifica alla tabella profiles per rimuovere la colonna 'specializations' di tipo array
-- e usare la nuova tabella di collegamento.
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='specializations') THEN
      ALTER TABLE public.profiles DROP COLUMN specializations;
   END IF;
END $$;
