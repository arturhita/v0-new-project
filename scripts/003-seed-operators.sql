-- 🌑 MOONTHIR - SCRIPT DI POPOLAMENTO OPERATORI V1.0 🌑
-- Eseguire questo script DOPO aver registrato gli utenti di test.
-- Questo script "promuove" utenti esistenti al ruolo di operatore.

-- ===================================================================================
-- !! ATTENZIONE !!
-- Incolla qui sotto gli INDIRIZZI EMAIL degli utenti che vuoi promuovere.
-- ===================================================================================

DO $$
DECLARE
    -- === INCOLLA QUI GLI EMAIL ===
    operator_1_email TEXT := 'email.operatore1@esempio.com';
    operator_2_email TEXT := 'email.operatore2@esempio.com';
    
    operator_1_id UUID;
    operator_2_id UUID;
BEGIN
    -- Trova gli ID degli utenti basandosi sulle loro email
    SELECT id INTO operator_1_id FROM auth.users WHERE email = operator_1_email;
    SELECT id INTO operator_2_id FROM auth.users WHERE email = operator_2_email;

    -- Controlla se gli utenti sono stati trovati
    IF operator_1_id IS NULL THEN
        RAISE EXCEPTION 'Utente operatore 1 con email % non trovato.', operator_1_email;
    END IF;
    IF operator_2_id IS NULL THEN
        RAISE EXCEPTION 'Utente operatore 2 con email % non trovato.', operator_2_email;
    END IF;

    -- Aggiorna il profilo dell'Operatore 1
    UPDATE public.profiles
    SET
        role = 'operator',
        full_name = 'Elara Luminosa',
        headline = 'Guida Stellare per Anima e Cuore',
        bio = 'Con decenni di esperienza nella lettura dei tarocchi e nell''astrologia, offro una guida chiara e compassionevole. Insieme, possiamo svelare i messaggi che le stelle hanno in serbo per te.',
        specializations = '{"tarocchi", "astrologia", "amore"}',
        application_status = 'approved',
        is_visible = true,
        commission_rate = 25.00,
        avatar_url = '/placeholder.svg?height=128&width=128&text=Elara'
    WHERE id = operator_1_id;

    -- Aggiorna il profilo dell'Operatore 2
    UPDATE public.profiles
    SET
        role = 'operator',
        full_name = 'Orion Saggio',
        headline = 'Interprete dei Sogni e dei Numeri',
        bio = 'La numerologia e l''interpretazione dei sogni sono le mie passioni. Ti aiuto a decodificare i simboli e i numeri che influenzano la tua vita, portando alla luce intuizioni profonde.',
        specializations = '{"numerologia", "sogni", "lavoro"}',
        application_status = 'approved',
        is_visible = true,
        commission_rate = 20.00,
        avatar_url = '/placeholder.svg?height=128&width=128&text=Orion'
    WHERE id = operator_2_id;

    -- Inserimento dei servizi per Elara (Operatore 1)
    INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
    VALUES
        (operator_1_id, 'call', 1.50, true),
        (operator_1_id, 'chat', 1.20, true)
    ON CONFLICT (operator_id, type) DO UPDATE SET price_per_minute = EXCLUDED.price_per_minute, is_active = EXCLUDED.is_active;

    -- Inserimento dei servizi per Orion (Operatore 2)
    INSERT INTO public.services (operator_id, type, price_per_consultation, is_active)
    VALUES
        (operator_2_id, 'written', 25.00, true)
    ON CONFLICT (operator_id, type) DO UPDATE SET price_per_consultation = EXCLUDED.price_per_consultation, is_active = EXCLUDED.is_active;

    INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
    VALUES
        (operator_2_id, 'call', 1.80, true)
    ON CONFLICT (operator_id, type) DO UPDATE SET price_per_minute = EXCLUDED.price_per_minute, is_active = EXCLUDED.is_active;

END $$;
