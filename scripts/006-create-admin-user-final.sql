DO $$
DECLARE
    -- !!! IMPORTANTE: SOSTITUISCI CON LA TUA EMAIL REALE QUI SOTTO !!!
    admin_email TEXT := 'tua-email-reale@esempio.com';
    admin_user_id UUID;
BEGIN
    -- Controlla se l'utente con questa email esiste già in auth.users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;

    -- Se l'utente non esiste (admin_user_id è NULL), allora lo creiamo
    IF admin_user_id IS NULL THEN
        -- Inserisci l'utente in auth.users e recupera il suo UUID generato automaticamente
        INSERT INTO auth.users (email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
        VALUES (
            admin_email,
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Admin Moonthir", "role":"admin"}',
            'authenticated',
            'authenticated'
        ) RETURNING id INTO admin_user_id;

        -- Ora, usa l'UUID appena ottenuto per creare il profilo corrispondente in public.profiles
        INSERT INTO public.profiles (id, full_name, email, role)
        VALUES (admin_user_id, 'Admin Moonthir', admin_email, 'admin');

        RAISE NOTICE 'Utente admin (%) creato con successo con ID: %', admin_email, admin_user_id;
    ELSE
        -- Se l'utente esiste già, controlliamo se per caso manca il profilo
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_user_id) THEN
            INSERT INTO public.profiles (id, full_name, email, role)
            VALUES (admin_user_id, 'Admin Moonthir', admin_email, 'admin');
            RAISE NOTICE 'Profilo creato per l''utente admin esistente (%).', admin_email;
        ELSE
            RAISE NOTICE 'L''utente admin (%) esiste già. Nessuna azione eseguita.', admin_email;
        END IF;
    END IF;
END $$;
