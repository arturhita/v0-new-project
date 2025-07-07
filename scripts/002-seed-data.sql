-- 🌑 MOONTHIR - SCRIPT DI POPOLAMENTO (SEED) V1.0 🌑
-- Eseguire questo script DOPO 001-master-schema.sql per inserire dati di esempio.

-- ===================================================================================
-- !! ATTENZIONE !!
-- 1. Crea 2 utenti di test in Supabase Studio -> Authentication -> Users.
-- 2. Copia i loro UUID.
-- 3. Incolla gli UUID qui sotto al posto dei placeholder.
-- ===================================================================================

DO $$
DECLARE
    -- === INCOLLA QUI I TUOI UUID ===
    operator_1_uuid UUID := 'INCOLLA-QUI-UUID-OPERATORE-1';
    operator_2_uuid UUID := 'INCOLLA-QUI-UUID-OPERATORE-2';
    client_1_uuid UUID := 'INCOLLA-QUI-UUID-CLIENTE-1'; -- Opzionale, per le recensioni
BEGIN
    -- Inserimento/Aggiornamento Operatore 1: Luna Stellare
    INSERT INTO public.profiles (id, role, full_name, headline, bio, specializations, avatar_url, application_status, is_visible, is_online, online_status)
    VALUES (
        operator_1_uuid,
        'operator',
        'Luna Stellare',
        'Cartomante Esperta in Tarocchi dell''Amore',
        'Con oltre 15 anni di esperienza, illumino il tuo cammino sentimentale con la saggezza dei tarocchi. Letture chiare, empatiche e dirette per aiutarti a trovare le risposte che cerchi.',
        ARRAY['Tarocchi', 'Amore e Relazioni', 'Cartomanzia', 'Ritorno d''amore'],
        '/placeholder.svg?width=128&height=128&text=Luna',
        'approved',
        true,
        true,
        'Online'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        specializations = EXCLUDED.specializations,
        application_status = EXCLUDED.application_status,
        is_visible = EXCLUDED.is_visible,
        is_online = EXCLUDED.is_online,
        online_status = EXCLUDED.online_status;

    -- Servizi per Luna Stellare
    INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
    VALUES (operator_1_uuid, 'chat', 1.50, true), (operator_1_uuid, 'call', 2.00, true)
    ON CONFLICT (operator_id, type) DO NOTHING;

    -- Inserimento/Aggiornamento Operatore 2: Maestro Cosmos
    INSERT INTO public.profiles (id, role, full_name, headline, bio, specializations, avatar_url, application_status, is_visible, is_online, online_status)
    VALUES (
        operator_2_uuid,
        'operator',
        'Maestro Cosmos',
        'Astrologo Professionista e Tema Natale',
        'Specializzato in astrologia karmica e analisi del tema natale. Scopri il tuo potenziale e le sfide della tua vita attraverso un''interpretazione astrologica profonda e personalizzata.',
        ARRAY['Astrologia', 'Tema Natale', 'Oroscopo', 'Sinastria di Coppia'],
        '/placeholder.svg?width=128&height=128&text=Cosmos',
        'approved',
        true,
        false,
        'Offline'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        specializations = EXCLUDED.specializations,
        application_status = EXCLUDED.application_status,
        is_visible = EXCLUDED.is_visible,
        is_online = EXCLUDED.is_online,
        online_status = EXCLUDED.online_status;

    -- Servizi per Maestro Cosmos
    INSERT INTO public.services (operator_id, type, price_per_minute, price_per_consultation, is_active)
    VALUES
        (operator_2_uuid, 'chat', 1.80, true),
        (operator_2_uuid, 'call', 2.50, true),
        (operator_2_uuid, 'written', 35.00, true)
    ON CONFLICT (operator_id, type) DO NOTHING;

    -- Inserimento Recensione di Esempio (se hai un UUID cliente)
    -- Se non hai un cliente, puoi commentare o rimuovere questa parte
    IF client_1_uuid != 'INCOLLA-QUI-UUID-CLIENTE-1' THEN
        INSERT INTO public.reviews (client_id, operator_id, rating, comment, is_approved)
        VALUES (client_1_uuid, operator_1_uuid, 5, 'Luna è stata incredibile! Precisa, gentile e mi ha dato dei consigli che si sono rivelati utilissimi. La consiglio a tutti!', true)
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
