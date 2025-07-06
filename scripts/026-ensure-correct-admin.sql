DO $$
DECLARE
    -- L'email dell'amministratore principale della piattaforma.
    admin_email TEXT := 'pagamenticonsulenza@gmail.com';
    admin_user_id UUID;
BEGIN
    -- 1. Cerca l'utente in auth.users per ottenere il suo ID.
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;

    -- 2. Se l'utente non esiste in auth.users, crealo.
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Utente admin con email % non trovato. Creazione in corso...', admin_email;
        
        -- Inserisce l'utente e recupera l'ID appena creato.
        -- La password non è impostata qui; l'admin dovrà usare "Password dimenticata".
        INSERT INTO auth.users (email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
        VALUES (
            admin_email,
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Admin Principale", "role":"admin"}',
            'authenticated',
            'authenticated'
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Utente admin creato con ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Utente admin con email % trovato con ID: %', admin_email, admin_user_id;
    END IF;

    -- 3. Ora che abbiamo l'ID, assicuriamoci che il profilo esista e abbia il ruolo di admin.
    -- Usiamo ON CONFLICT per inserire se non esiste, o aggiornare se esiste già.
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (admin_user_id, 'Admin Principale', admin_email, 'admin')
    ON CONFLICT (id) 
    DO UPDATE SET 
        role = 'admin',
        full_name = 'Admin Principale',
        email = admin_email;

    RAISE NOTICE 'Profilo per l''utente % assicurato con ruolo admin.', admin_email;

END $$;
