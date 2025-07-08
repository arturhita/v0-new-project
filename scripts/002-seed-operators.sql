-- Questo script "promuove" utenti esistenti a operatori e popola i loro dati.
-- ASSICURATI DI AVER PRIMA REGISTRATO QUESTI UTENTI TRAMITE L'APP.

DO $$
DECLARE
    -- !!! IMPORTANTE: Sostituisci queste email con quelle che hai registrato !!!
    operator_1_email TEXT := 'luna.stellare@example.com';
    operator_2_email TEXT := 'sol.divino@example.com';

    operator_1_id UUID;
    operator_2_id UUID;
BEGIN
    -- Step 1: Trova gli ID utente dalle email
    SELECT id INTO operator_1_id FROM auth.users WHERE email = operator_1_email;
    SELECT id INTO operator_2_id FROM auth.users WHERE email = operator_2_email;

    -- Controlla se gli utenti sono stati trovati
    IF operator_1_id IS NULL OR operator_2_id IS NULL THEN
        RAISE EXCEPTION 'Una o entrambe le email degli operatori non sono state trovate in auth.users. Per favore, registrale prima e conferma l''email.';
    END IF;

    -- Step 2: Aggiorna il loro ruolo nella tabella dei profili
    UPDATE public.profiles SET role = 'operator' WHERE id IN (operator_1_id, operator_2_id);

    -- Step 3: Inserisci i loro dettagli specifici in operator_details
    -- Operatore 1: Luna Stellare
    INSERT INTO public.operator_details (user_id, stage_name, bio, specialties, status, commission_rate)
    VALUES (operator_1_id, 'Luna Stellare', 'Esperta di tarocchi e astrologia con oltre 10 anni di esperienza nel campo dell''amore e del lavoro.', '{"Tarocchi", "Amore", "Lavoro"}', 'approved', 15.00)
    ON CONFLICT (user_id) DO UPDATE SET
        stage_name = EXCLUDED.stage_name,
        bio = EXCLUDED.bio,
        specialties = EXCLUDED.specialties,
        status = EXCLUDED.status;

    -- Operatore 2: Sol Divino
    INSERT INTO public.operator_details (user_id, stage_name, bio, specialties, status, commission_rate)
    VALUES (operator_2_id, 'Sol Divino', 'Cartomante e sensitivo, specializzato in percorsi di crescita personale e letture karmiche.', '{"Cartomanzia", "Astrologia Karmica", "Crescita Personale"}', 'approved', 15.00)
    ON CONFLICT (user_id) DO UPDATE SET
        stage_name = EXCLUDED.stage_name,
        bio = EXCLUDED.bio,
        specialties = EXCLUDED.specialties,
        status = EXCLUDED.status;

    -- Step 4: Inserisci i loro servizi
    -- Servizi per Luna Stellare
    INSERT INTO public.services (operator_id, service_type, price, is_enabled)
    VALUES
        (operator_1_id, 'chat', 2.50, true),
        (operator_1_id, 'call', 3.50, true),
        (operator_1_id, 'email', 30.00, false)
    ON CONFLICT (operator_id, service_type) DO UPDATE SET
        price = EXCLUDED.price,
        is_enabled = EXCLUDED.is_enabled;

    -- Servizi per Sol Divino
    INSERT INTO public.services (operator_id, service_type, price, is_enabled)
    VALUES
        (operator_2_id, 'chat', 2.75, true),
        (operator_2_id, 'call', 4.00, true),
        (operator_2_id, 'email', 35.00, true)
    ON CONFLICT (operator_id, service_type) DO UPDATE SET
        price = EXCLUDED.price,
        is_enabled = EXCLUDED.is_enabled;

END $$;
