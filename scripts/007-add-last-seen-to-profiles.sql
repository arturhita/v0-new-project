-- Aggiunge la colonna 'last_seen' alla tabella dei profili.
-- Questa colonna memorizzerà l'ultimo timestamp in cui un operatore è stato rilevato online.
-- TIMESTAMPTZ è un tipo di dato che include il fuso orario, rendendolo robusto.

ALTER TABLE public.profiles
ADD COLUMN last_seen TIMESTAMPTZ;
