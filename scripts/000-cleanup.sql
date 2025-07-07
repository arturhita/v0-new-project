-- 🌑 MOONTHIR - SCRIPT DI PULIZIA 🌑
-- Eseguire questo script per primo per rimuovere tutte le tabelle e i tipi creati in precedenza.
-- ATTENZIONE: Questo cancellerà i dati nelle tabelle specificate.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.application_status;
DROP TYPE IF EXISTS public.service_type;
