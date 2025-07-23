-- Tabella per tracciare le sessioni di consulenza dal vivo
CREATE TABLE IF NOT EXISTS public.live_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'active', 'completed', 'interrupted_low_balance', 'failed'
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    rate_per_minute NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(10, 2) DEFAULT 0.00,
    client_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.live_consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own consultations." ON public.live_consultations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Admins can manage all consultations." ON public.live_consultations FOR ALL USING (public.is_admin(auth.uid()));

-- Tabella per i guadagni degli operatori
CREATE TABLE IF NOT EXISTS public.operator_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id UUID NOT NULL REFERENCES public.live_consultations(id) ON DELETE CASCADE,
    gross_amount NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(5, 4) NOT NULL,
    net_amount NUMERIC(10, 2) NOT NULL,
    payout_id UUID REFERENCES public.payouts(id) ON DELETE SET NULL, -- Per tracciare quando è stato pagato
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can view their own earnings." ON public.operator_earnings FOR SELECT USING (auth.uid() = operator_id);
CREATE POLICY "Admins can manage all earnings." ON public.operator_earnings FOR ALL USING (public.is_admin(auth.uid()));


-- Funzione per avviare una consulenza
CREATE OR REPLACE FUNCTION public.start_live_consultation(p_operator_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id UUID := auth.uid();
    v_client_balance NUMERIC;
    v_operator_rate NUMERIC;
    v_consultation_id UUID;
BEGIN
    -- Recupera il costo al minuto dell'operatore
    SELECT rate_per_minute INTO v_operator_rate FROM public.profiles WHERE id = p_operator_id;
    IF v_operator_rate IS NULL OR v_operator_rate <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tasso operatore non valido o non impostato.');
    END IF;

    -- Controlla il saldo del cliente
    SELECT balance INTO v_client_balance FROM public.wallets WHERE user_id = v_client_id;
    IF v_client_balance < v_operator_rate THEN
        RETURN jsonb_build_object('success', false, 'message', 'Credito insufficiente per avviare la consulenza. Sono richiesti almeno ' || v_operator_rate || '€.');
    END IF;

    -- Crea la sessione di consulenza
    INSERT INTO public.live_consultations (client_id, operator_id, status, started_at, rate_per_minute)
    VALUES (v_client_id, p_operator_id, 'active', now(), v_operator_rate)
    RETURNING id INTO v_consultation_id;

    RETURN jsonb_build_object('success', true, 'consultation_id', v_consultation_id);
END;
$$;

-- Funzione per terminare una consulenza e fatturare
CREATE OR REPLACE FUNCTION public.end_live_consultation(p_consultation_id UUID, p_duration_seconds INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_consultation public.live_consultations;
    v_total_cost NUMERIC;
    v_client_id UUID;
    v_operator_id UUID;
    v_rate_per_minute NUMERIC;
    v_commission_rate NUMERIC := 0.20; -- Esempio: commissione del 20%
    v_net_earning NUMERIC;
    v_transaction_result JSONB;
    v_transaction_id UUID;
BEGIN
    -- Recupera i dati della consulenza
    SELECT * INTO v_consultation FROM public.live_consultations WHERE id = p_consultation_id;
    IF v_consultation.status != 'active' THEN
        RETURN jsonb_build_object('success', false, 'message', 'La consulenza non è attiva o è già stata terminata.');
    END IF;

    v_client_id := v_consultation.client_id;
    v_operator_id := v_consultation.operator_id;
    v_rate_per_minute := v_consultation.rate_per_minute;

    -- Calcola il costo totale
    v_total_cost := (p_duration_seconds / 60.0) * v_rate_per_minute;
    v_total_cost := round(v_total_cost, 2);

    -- Addebita il cliente usando la funzione del portafoglio
    v_transaction_result := public.update_wallet_balance(
        v_client_id,
        -v_total_cost,
        'consultation_fee',
        'Addebito per consulenza con operatore ' || (SELECT full_name FROM public.profiles WHERE id = v_operator_id),
        jsonb_build_object('consultation_id', p_consultation_id)
    );

    IF NOT (v_transaction_result->>'success')::boolean THEN
        -- Se l'addebito fallisce, interrompi la consulenza
        UPDATE public.live_consultations SET status = 'interrupted_low_balance', ended_at = now(), duration_seconds = p_duration_seconds, total_cost = 0 WHERE id = p_consultation_id;
        RETURN jsonb_build_object('success', false, 'message', 'Addebito fallito: ' || (v_transaction_result->>'message'));
    END IF;

    v_transaction_id := (v_transaction_result->>'transaction_id')::UUID;

    -- Calcola e registra i guadagni dell'operatore
    v_net_earning := v_total_cost * (1 - v_commission_rate);
    INSERT INTO public.operator_earnings (operator_id, consultation_id, gross_amount, commission_rate, net_amount)
    VALUES (v_operator_id, p_consultation_id, v_total_cost, v_commission_rate, v_net_earning);

    -- Aggiorna lo stato della consulenza
    UPDATE public.live_consultations
    SET status = 'completed',
        ended_at = now(),
        duration_seconds = p_duration_seconds,
        total_cost = v_total_cost,
        client_transaction_id = v_transaction_id
    WHERE id = p_consultation_id;

    RETURN jsonb_build_object('success', true, 'message', 'Consulenza terminata e fatturata con successo.');
END;
$$;
