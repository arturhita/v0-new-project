-- Questo script aggiorna il ruolo di un utente specifico a 'admin'.
-- Assicurati che l'utente con l'email 'pagamenticonsulenza@gmail.com' esista già
-- nella tabella 'profiles' prima di eseguire questo script.

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'pagamenticonsulenza@gmail.com';

-- Dopo aver eseguito questo script, l'utente potrà accedere alla dashboard di amministrazione
-- al suo prossimo login.
