CREATE OR REPLACE FUNCTION answer_and_credit_operator(
    p_consultation_id UUID,
    p_operator_id UUID,
    p_answer_text TEXT
)
RETURNS VOID AS $$
DECLARE
    v_consultation RECORD;
    v_operator_wallet_id UUID;
BEGIN
    -- 1. Trova il consulto e verifica che l'operatore sia corretto e che sia in attesa
    SELECT * INTO v_consultation
    FROM public.written_consultations
    WHERE id = p_consultation_id AND operator_id = p_operator_id AND status = 'pending';

    IF v_consultation IS NULL THEN
        RAISE EXCEPTION 'Consulto non trovato, non autorizzato, o già risposto.';
    END IF;

    -- 2. Aggiorna il consulto con la risposta
    UPDATE public.written_consultations
    SET
        answer = p_answer_text,
        status = 'answered',
        answered_at = now()
    WHERE id = p_consultation_id;

    -- 3. Trova o crea il portafoglio dell'operatore
    SELECT id INTO v_operator_wallet_id FROM public.wallets WHERE user_id = p_operator_id;

    IF v_operator_wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id, balance) VALUES (p_operator_id, 0)
        RETURNING id INTO v_operator_wallet_id;
    END IF;

    -- 4. Aggiorna il saldo del portafoglio dell'operatore
    UPDATE public.wallets
    SET balance = balance + v_consultation.price_at_request
    WHERE id = v_operator_wallet_id;

    -- 5. Registra la transazione di guadagno per l'operatore
    INSERT INTO public.transactions (user_id, amount, type, description)
    VALUES (p_operator_id, v_consultation.price_at_request, 'earning', 'Guadagno da consulto scritto ' || p_consultation_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
