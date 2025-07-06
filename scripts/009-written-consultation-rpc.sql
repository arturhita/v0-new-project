-- Funzione per processare una richiesta di consulto scritto in modo transazionale
CREATE OR REPLACE FUNCTION process_written_consultation(
    p_client_id UUID,
    p_operator_id UUID,
    p_question TEXT
)
RETURNS VOID AS $$
DECLARE
    v_price NUMERIC;
    v_client_balance NUMERIC;
BEGIN
    -- 1. Ottieni il prezzo del servizio dall'operatore
    SELECT (services->'written'->>'price')::NUMERIC INTO v_price
    FROM public.profiles
    WHERE id = p_operator_id AND services->'written'->>'enabled' = 'true';

    IF v_price IS NULL THEN
        RAISE EXCEPTION 'L''operatore non offre questo servizio o il prezzo non è impostato.';
    END IF;

    -- 2. Controlla il saldo del cliente
    SELECT balance INTO v_client_balance
    FROM public.wallets
    WHERE user_id = p_client_id;

    IF v_client_balance IS NULL OR v_client_balance < v_price THEN
        RAISE EXCEPTION 'insufficient funds';
    END IF;

    -- 3. Aggiorna il saldo del cliente
    UPDATE public.wallets
    SET balance = balance - v_price
    WHERE user_id = p_client_id;

    -- 4. Registra la transazione di spesa
    INSERT INTO public.transactions (user_id, amount, type, description, stripe_payment_intent_id)
    VALUES (p_client_id, -v_price, 'expense', 'Consulto scritto con operatore ' || p_operator_id, 'written_consultation_' || gen_random_uuid());

    -- 5. Crea il record del consulto scritto
    INSERT INTO public.written_consultations (client_id, operator_id, question, price_at_request)
    VALUES (p_client_id, p_operator_id, p_question, v_price);

END;
$$ LANGUAGE plpgsql;
