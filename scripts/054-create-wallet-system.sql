-- 1. Tabella per i portafogli degli utenti
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wallet." ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all wallets." ON public.wallets FOR ALL USING (public.is_admin(auth.uid()));

-- Trigger per aggiornare 'updated_at'
CREATE TRIGGER on_wallet_updated
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 2. Tabella per le transazioni
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'consultation_fee', 'refund', 'bonus'
    status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    description TEXT,
    metadata JSONB, -- Per dati extra, es. { "consultation_id": "...", "stripe_charge_id": "..." }
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all transactions." ON public.transactions FOR ALL USING (public.is_admin(auth.uid()));

-- 3. Funzione per creare un portafoglio per un nuovo utente
CREATE OR REPLACE FUNCTION public.create_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- 4. Trigger che chiama la funzione alla creazione di un nuovo profilo
CREATE TRIGGER on_new_profile_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_wallet();

-- 5. Funzione SQL sicura per aggiornare il saldo e registrare la transazione
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
    p_user_id UUID,
    p_amount NUMERIC,
    p_transaction_type TEXT,
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_new_balance NUMERIC;
    v_transaction_id UUID;
BEGIN
    -- Trova il wallet dell'utente
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id;

    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    -- Aggiorna il saldo del portafoglio
    UPDATE public.wallets
    SET balance = balance + p_amount
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;

    -- Inserisci la transazione
    INSERT INTO public.transactions (wallet_id, user_id, amount, type, description, metadata)
    VALUES (v_wallet_id, p_user_id, p_amount, p_transaction_type, p_description, p_metadata)
    RETURNING id INTO v_transaction_id;

    -- Ritorna il nuovo saldo e l'ID della transazione
    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'transaction_id', v_transaction_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
