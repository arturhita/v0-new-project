-- Aggiunge le colonne 'specialties' e 'categories' come array di testo alla tabella 'profiles'.
-- Questo allinea lo schema del database con i dati che l'applicazione cerca di salvare e leggere.
-- L'uso di IF NOT EXISTS rende lo script sicuro da eseguire più volte.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- NOTA: Il campo 'tags' non è utilizzato, ma 'specialties' verrà usato per popolare i tag nella UI.
-- Il campo 'specialization' (singolare) non esiste e viene derivato dal primo elemento di 'categories'.
