-- 🌑 MOONTHIR - SCRIPT DI PULIZIA TOTALE V1.0 🌑
-- Eseguire questo script per primo per rimuovere tutte le tabelle e i tipi creati in precedenza.
-- ATTENZIONE: Questo cancellerà tutti i dati nelle tabelle specificate.

-- Rimuove il trigger e la funzione associata
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Rimuove le tabelle in ordine inverso di dipendenza
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Rimuove i tipi ENUM personalizzati
DROP TYPE IF EXISTS public.transaction_type;
DROP TYPE IF EXISTS public.consultation_status;
DROP TYPE IF EXISTS public.service_type;
DROP TYPE IF EXISTS public.application_status;
DROP TYPE IF EXISTS public.user_role;
