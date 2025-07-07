-- 🌑 MOONTHIR - SEED DATA V1.0 🌑
-- Questo script popola il database con dati di esempio.
-- ESEGUIRE DOPO 001-master-schema.sql
-- ATTENZIONE: Prima di eseguire, crea 2 utenti "operatori" nella dashboard di Supabase
-- e incolla i loro UUID qui sotto.

-- Inserimento di due operatori di esempio
-- Sostituisci gli UUID con quelli reali dei tuoi utenti di test
UPDATE public.profiles
SET
    role = 'operator',
    full_name = 'Elara',
    headline = 'Guida Stellare per Anima e Cuore',
    bio = 'Con decenni di esperienza nella lettura dei tarocchi e nell''astrologia, offro una guida chiara e compassionevole. Insieme, possiamo svelare i messaggi che le stelle hanno in serbo per te e trovare il percorso verso la serenità.',
    specializations = '{"tarocchi", "astrologia", "amore"}',
    application_status = 'approved',
    is_visible = true,
    commission_rate = 25.00,
    avatar_url = '/placeholder.svg?height=100&width=100'
WHERE id = 'INCOLLA-QUI-UUID-OPERATORE-1'; -- <--- INCOLLA QUI

UPDATE public.profiles
SET
    role = 'operator',
    full_name = 'Orion',
    headline = 'Interprete dei Sogni e dei Numeri',
    bio = 'La numerologia e l''interpretazione dei sogni sono le mie passioni. Ti aiuto a decodificare i simboli e i numeri che influenzano la tua vita, portando alla luce intuizioni profonde per il tuo futuro lavorativo e personale.',
    specializations = '{"numerologia", "sogni", "lavoro"}',
    application_status = 'approved',
    is_visible = true,
    commission_rate = 20.00,
    avatar_url = '/placeholder.svg?height=100&width=100'
WHERE id = 'INCOLLA-QUI-UUID-OPERATORE-2'; -- <--- INCOLLA QUI

-- Inserimento dei servizi per Elara
INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
VALUES
    ('INCOLLA-QUI-UUID-OPERATORE-1', 'call', 1.50, true),
    ('INCOLLA-QUI-UUID-OPERATORE-1', 'chat', 1.20, true);

-- Inserimento dei servizi per Orion
INSERT INTO public.services (operator_id, type, price_per_consultation, is_active)
VALUES
    ('INCOLLA-QUI-UUID-OPERATORE-2', 'written', 25.00, true);
INSERT INTO public.services (operator_id, type, price_per_minute, is_active)
VALUES
    ('INCOLLA-QUI-UUID-OPERATORE-2', 'call', 1.80, true);

-- Inserimento di una recensione di esempio per Elara
-- (Richiede un utente 'client' esistente)
-- INSERT INTO public.reviews (client_id, operator_id, rating, comment, is_approved)
-- VALUES
--     ('INCOLLA-QUI-UUID-CLIENTE', 'INCOLLA-QUI-UUID-OPERATORE-1', 5, 'Elara è stata incredibilmente precisa e gentile. Mi ha dato la chiarezza che cercavo. Consigliatissima!', true);
