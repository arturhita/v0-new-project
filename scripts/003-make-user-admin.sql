-- Imposta un utente specifico come amministratore
    -- Questo script trova l'utente tramite la sua email e aggiorna il suo ruolo a 'admin'.
    -- Assicurati che l'utente con questa email esista già nella tabella 'profiles'.

    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = 'pagamenticonsulenza@gmail.com';

    -- Dopo aver eseguito lo script, puoi verificare la modifica con la seguente query:
    -- SELECT id, email, role FROM public.profiles WHERE email = 'pagamenticonsulenza@gmail.com';
