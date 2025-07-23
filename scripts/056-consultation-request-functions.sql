DROP FUNCTION IF EXISTS can_start_consultation(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION can_start_consultation(
    p_client_id UUID,
    p_operator_id UUID,
    p_service_type TEXT
)
RETURNS JSONB AS $$
DECLARE
    client_balance NUMERIC;
    operator_rate NUMERIC;
    operator_is_online BOOLEAN;
    min_balance_required NUMERIC;
BEGIN
    -- Get client wallet balance
    SELECT balance INTO client_balance FROM wallets WHERE user_id = p_client_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('can_start', false, 'reason', 'Portafoglio non trovato.');
    END IF;

    -- Get operator rate and status
    SELECT
        CASE
            WHEN p_service_type = 'chat' THEN (s.service_data->'chat'->>'price_per_minute')::NUMERIC
            WHEN p_service_type = 'call' THEN (s.service_data->'call'->>'price_per_minute')::NUMERIC
            ELSE 0
        END,
        p.is_online
    INTO operator_rate, operator_is_online
    FROM profiles p
    LEFT JOIN operator_services s ON p.id = s.user_id
    WHERE p.id = p_operator_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('can_start', false, 'reason', 'Operatore non trovato.');
    END IF;

    IF operator_rate IS NULL OR operator_rate <= 0 THEN
        RETURN jsonb_build_object('can_start', false, 'reason', 'Tariffa operatore non disponibile o non valida.');
    END IF;

    -- Check if operator is online
    IF operator_is_online IS NOT TRUE THEN
        RETURN jsonb_build_object('can_start', false, 'reason', 'L''operatore non è online.');
    END IF;

    -- We require at least 1 minute of credit to start
    min_balance_required := operator_rate;

    IF client_balance < min_balance_required THEN
        RETURN jsonb_build_object('can_start', false, 'reason', 'Credito insufficiente. Sono richiesti almeno ' || min_balance_required || '€ per iniziare.');
    END IF;

    RETURN jsonb_build_object('can_start', true, 'reason', 'OK');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
