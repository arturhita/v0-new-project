-- Tabella per memorizzare il saldo di ogni utente
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Funzione per aggiornare 'updated_at'
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare 'updated_at' sulla tabella wallets
CREATE TRIGGER set_wallets_timestamp
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Tabella per registrare ogni transazione (ricariche e pagamenti consulti)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')), -- 'credit' per ricariche, 'debit' per pagamenti
    description TEXT,
    metadata JSONB, -- Per dati extra, come stripe_payment_intent_id o consultation_id
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Abilita Row Level Security (RLS)
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere e gestire solo il proprio portafoglio
CREATE POLICY "Users can manage their own wallet"
ON public.wallets
FOR ALL
USING (auth.uid() = user_id);

-- Policy: Gli utenti possono vedere solo le proprie transazioni
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.wallets
    WHERE wallets.id = transactions.wallet_id AND wallets.user_id = auth.uid()
));

-- Funzione per creare automaticamente un portafoglio per un nuovo utente
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger che chiama la funzione quando un nuovo profilo viene creato
CREATE TRIGGER on_new_profile_create_wallet
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_wallet();

-- Abilita Realtime per wallets e transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'wallets') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'transactions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
END;
$$;
