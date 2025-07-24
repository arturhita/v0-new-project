-- Prima elimina la funzione esistente, se presente, per consentire la modifica del nome del parametro.
DROP FUNCTION IF EXISTS public.get_operator_services(uuid);

-- Funzione per ottenere i servizi di un operatore come oggetto JSONB pulito.
-- Fornisce un valore di default se i servizi non sono mai stati impostati.
CREATE OR REPLACE FUNCTION get_operator_services(p_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    services_data jsonb;
BEGIN
    -- Seleziona i servizi per il profilo specificato dalla tabella 'profiles'
    SELECT
        profiles.services
    INTO
        services_data
    FROM
        public.profiles
    WHERE
        profiles.id = p_profile_id;

    -- Se il campo 'services' è NULL (l'operatore non ha mai salvato le impostazioni),
    -- restituisce una struttura JSON di default.
    IF services_data IS NULL THEN
        services_data := '{
            "chat": {"enabled": false, "price_per_minute": 0},
            "call": {"enabled": false, "price_per_minute": 0},
            "video": {"enabled": false, "price_per_minute": 0}
        }';
    END IF;

    -- Restituisce i dati dei servizi. La conversione a jsonb è implicita e garantisce
    -- che il client riceva un oggetto JSON standard.
    RETURN services_data;
END;
$$;

-- Concede i permessi di esecuzione della funzione agli utenti autenticati e al ruolo di servizio.
GRANT EXECUTE ON FUNCTION public.get_operator_services(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_operator_services(uuid) TO service_role;
