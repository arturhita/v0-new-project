-- Questo script corregge l'incompatibilità di tipo (integer vs uuid) e popola il database.
-- È sicuro da eseguire anche se le tabelle esistono già.

-- 1. Rimuove le tabelle esistenti in ordine per evitare problemi di dipendenza.
-- Usiamo CASCADE per rimuovere anche tutti gli oggetti dipendenti (constraints, etc.)
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.operator_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- 2. Ricrea le tabelle con la struttura corretta (usando UUID)

-- Tabella Categorie
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.categories IS 'Memorizza le categorie di specializzazione degli operatori.';

-- Tabella di collegamento Operatori-Categorie (Molti-a-Molti)
CREATE TABLE public.operator_categories (
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, category_id)
);
COMMENT ON TABLE public.operator_categories IS 'Collega gli operatori alle loro categorie di specializzazione.';

-- Tabella Recensioni
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_review_per_client_operator UNIQUE (client_id, operator_id)
);
COMMENT ON TABLE public.reviews IS 'Memorizza le recensioni lasciate dai clienti per gli operatori.';

-- 3. Abilita RLS (Row Level Security)
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

-- 4. Policies RLS
-- Chiunque può leggere categorie, associazioni e recensioni
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to operator_categories" ON public.operator_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);

-- Gli utenti autenticati possono creare recensioni
CREATE POLICY "Allow authenticated users to create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Gli utenti possono aggiornare solo le proprie recensioni
CREATE POLICY "Allow users to update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = client_id);

-- Gli admin possono fare tutto
CREATE POLICY "Allow admin full access to categories" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access to operator_categories" ON public.operator_categories FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access to reviews" ON public.reviews FOR ALL USING (public.is_admin(auth.uid()));

-- 5. Rimuove la vecchia colonna 'specializations' se esiste
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='specializations') THEN
      ALTER TABLE public.profiles DROP COLUMN specializations;
   END IF;
END $$;

-- 6. SEEDING: Popolamento del database con dati di esempio

-- Inserimento Categorie
INSERT INTO public.categories (name, slug, description)
VALUES
    ('Cartomanzia', 'cartomanzia', 'Lettura delle carte per interpretare presente, passato e futuro.'),
    ('Astrologia', 'astrologia', 'Studio degli astri e dei loro influssi sulla vita terrena.'),
    ('Tarocchi', 'tarocchi', 'Antica arte divinatoria che utilizza un mazzo di tarocchi.'),
    ('Ritualistica', 'ritualistica', 'Pratiche e rituali per amore, fortuna e purificazione.')
ON CONFLICT (slug) DO NOTHING;

-- Dichiarazione delle variabili per gli UUID
DO $$
DECLARE
    stella_divina_id UUID;
    elara_id UUID;
    cartomanzia_id UUID;
    astrologia_id UUID;
    tarocchi_id UUID;
    client_user_id UUID;
BEGIN
    -- Creiamo o troviamo un utente cliente fittizio
    INSERT INTO public.profiles (full_name, email, role)
    VALUES ('Mario Rossi', 'mario.rossi.cliente@example.com', 'client')
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO client_user_id;

    -- Inserimento Operatore 1: Stella Divina
    INSERT INTO public.profiles (full_name, stage_name, email, bio, role, profile_image_url, is_available, service_prices)
    VALUES (
        'Stella Rossi',
        'Stella Divina',
        'stella.divina@example.com',
        'Con oltre 20 anni di esperienza, guido le anime smarrite verso la luce. Specializzata in tarocchi dell''amore e astrologia karmica.',
        'operator',
        '/placeholder.svg?height=128&width=128',
        true,
        '{"chat": 1.5, "call": 2.5, "email": 25.0}'::jsonb
    )
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO stella_divina_id;

    -- Inserimento Operatore 2: Elara
    INSERT INTO public.profiles (full_name, stage_name, email, bio, role, profile_image_url, is_available, service_prices)
    VALUES (
        'Laura Bianchi',
        'Elara',
        'elara.cartomante@example.com',
        'Interpreto i messaggi delle stelle e dei tarocchi per offrirti una visione chiara del tuo percorso. La mia missione è portarti serenità.',
        'operator',
        '/placeholder.svg?height=128&width=128',
        false,
        '{"chat": 1.2, "call": 2.0, "email": 20.0}'::jsonb
    )
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO elara_id;

    -- Recupero UUID delle categorie
    SELECT id INTO cartomanzia_id FROM public.categories WHERE slug = 'cartomanzia';
    SELECT id INTO astrologia_id FROM public.categories WHERE slug = 'astrologia';
    SELECT id INTO tarocchi_id FROM public.categories WHERE slug = 'tarocchi';

    -- Associazione Categorie a Operatori
    IF stella_divina_id IS NOT NULL AND tarocchi_id IS NOT NULL THEN
        INSERT INTO public.operator_categories (operator_id, category_id) VALUES (stella_divina_id, tarocchi_id) ON CONFLICT DO NOTHING;
    END IF;
    IF stella_divina_id IS NOT NULL AND astrologia_id IS NOT NULL THEN
        INSERT INTO public.operator_categories (operator_id, category_id) VALUES (stella_divina_id, astrologia_id) ON CONFLICT DO NOTHING;
    END IF;
    IF elara_id IS NOT NULL AND cartomanzia_id IS NOT NULL THEN
        INSERT INTO public.operator_categories (operator_id, category_id) VALUES (elara_id, cartomanzia_id) ON CONFLICT DO NOTHING;
    END IF;
    IF elara_id IS NOT NULL AND tarocchi_id IS NOT NULL THEN
        INSERT INTO public.operator_categories (operator_id, category_id) VALUES (elara_id, tarocchi_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Inserisci recensioni solo se abbiamo tutti gli ID necessari
    IF client_user_id IS NOT NULL AND stella_divina_id IS NOT NULL THEN
        INSERT INTO public.reviews (client_id, operator_id, rating, comment)
        VALUES (client_user_id, stella_divina_id, 5, 'Stella è stata incredibile! Ha visto cose del mio passato che non poteva sapere e mi ha dato una speranza immensa per il futuro. Consigliatissima!')
        ON CONFLICT (client_id, operator_id) DO NOTHING;
    END IF;
    IF client_user_id IS NOT NULL AND elara_id IS NOT NULL THEN
        INSERT INTO public.reviews (client_id, operator_id, rating, comment)
        VALUES (client_user_id, elara_id, 4, 'Consulto molto buono, Elara è gentile e professionale. Forse un po'' troppo sbrigativa alla fine, ma nel complesso sono soddisfatto.')
        ON CONFLICT (client_id, operator_id) DO NOTHING;
    END IF;
END $$;
