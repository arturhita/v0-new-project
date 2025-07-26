-- Funzione per aggiungere credito al portafoglio e registrare la transazione in modo sicuro
CREATE OR REPLACE FUNCTION add_wallet_balance_and_log_transaction(
    p_user_id UUID,
    p_amount_euros NUMERIC,
    p_stripe_payment_intent_id TEXT,
    p_package_id TEXT,
    p_transaction_metadata JSONB
)
RETURNS VOID AS $$
DECLARE
    v_transaction_exists BOOLEAN;
BEGIN
    -- 1. Controllo di Idempotenza: Verifica se questa transazione è già stata processata.
    -- Questo previene doppi accrediti se Stripe invia il webhook più volte.
    SELECT EXISTS (
        SELECT 1
        FROM public.transactions
        WHERE stripe_payment_intent_id = p_stripe_payment_intent_id
    ) INTO v_transaction_exists;

    -- Se la transazione esiste già, esce senza fare nulla.
    IF v_transaction_exists THEN
        RETURN;
    END IF;

    -- 2. Aggiorna il saldo del portafoglio dell'utente
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + p_amount_euros
    WHERE id = p_user_id;

    -- 3. Registra la transazione per la cronologia
    INSERT INTO public.transactions (user_id, type, amount, status, stripe_payment_intent_id, metadata)
    VALUES (p_user_id, 'deposit', p_amount_euros, 'completed', p_stripe_payment_intent_id, p_transaction_metadata);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
