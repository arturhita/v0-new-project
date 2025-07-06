DO $$
DECLARE
    -- !!! IMPORTANTE: SOSTITUISCI CON LA TUA EMAIL REALE QUI SOTTO !!!
    admin_email TEXT := 'tua-email-reale@esempio.com';
    admin_uuid UUID := 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0'; -- UUID statico per l'admin
BEGIN
    -- Controlla se l'utente esiste già in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        -- Se non esiste, inserisci l'utente in auth.users
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES
        (
          '00000000-0000-0000-0000-000000000000',
          admin_uuid,
          'authenticated',
          'authenticated',
          admin_email,
          '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', -- Password non valida, da resettare
          NOW(),
          '{"provider":"email","providers":["email"]}',
          '{"name":"Admin Moonthir", "role": "admin"}',
          NOW(),
          NOW()
        );

        -- E inserisci il profilo corrispondente in public.profiles
        INSERT INTO public.profiles (id, full_name, email, role)
        VALUES
        (admin_uuid, 'Admin Moonthir', admin_email, 'admin');

        RAISE NOTICE 'Utente admin (%) creato con successo.', admin_email;
    ELSE
        RAISE NOTICE 'L''utente admin (%) esiste già. Nessuna azione eseguita.', admin_email;
    END IF;
END $$;
