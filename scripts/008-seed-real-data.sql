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
BEGIN
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
    -- Stella Divina: Tarocchi, Astrologia
    IF stella_divina_id IS NOT NULL AND tarocchi_id IS NOT NULL THEN
        INSERT INTO public.operator_categories (operator_id, category_id) VALUES (stella_divina_id, tarocchi_id) ON CONFLICT DO NOTHING;
    END IF;
    IF stella_divina_id IS NOT NULL AND astrologia_id IS NOT NULL THEN
        INSERT INTO public.operator_categories (operator_id, category_id) VALUES (stella_divina_id, astrologia_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Elara: Cartomanzia, Tarocchi
    IF elara_id IS NOT NULL AND cartomanzia_id IS NOT NULL THEN
        INSERT INTO public.operator_categories (operator_id, category_id) VALUES (elara_id, cartomanzia_id) ON CONFLICT DO NOTHING;
    END IF;
    IF elara_id IS NOT NULL AND tarocchi_id IS NOT NULL THEN
        INSERT INTO public.operator_categories (operator_id, category_id) VALUES (elara_id, tarocchi_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Inserimento Recensioni (assumendo che esista un utente cliente)
    -- Creiamo un utente cliente fittizio se non esiste
    DECLARE
        client_user_id UUID;
    BEGIN
        INSERT INTO public.profiles (full_name, email, role)
        VALUES ('Mario Rossi', 'mario.rossi.cliente@example.com', 'client')
        ON CONFLICT (email) DO NOTHING;

        -- Recuperiamo l'ID dell'utente cliente
        SELECT id INTO client_user_id FROM public.profiles WHERE email = 'mario.rossi.cliente@example.com';

        -- Inserisci recensioni solo se abbiamo tutti gli ID necessari
        IF client_user_id IS NOT NULL AND stella_divina_id IS NOT NULL THEN
            INSERT INTO public.reviews (client_id, operator_id, rating, comment)
            VALUES (client_user_id, stella_divina_id, 5, 'Stella è stata incredibile! Ha visto cose del mio passato che non poteva sapere e mi ha dato una speranza immensa per il futuro. Consigliatissima!')
            ON CONFLICT (client_id, operator_id) DO NOTHING; -- Evita recensioni duplicate dallo stesso utente per lo stesso operatore
        END IF;

        IF client_user_id IS NOT NULL AND elara_id IS NOT NULL THEN
            INSERT INTO public.reviews (client_id, operator_id, rating, comment)
            VALUES (client_user_id, elara_id, 4, 'Consulto molto buono, Elara è gentile e professionale. Forse un po'' troppo sbrigativa alla fine, ma nel complesso sono soddisfatto.')
            ON CONFLICT (client_id, operator_id) DO NOTHING;
        END IF;
    END;
END $$;
