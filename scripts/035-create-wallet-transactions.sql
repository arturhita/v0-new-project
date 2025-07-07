-- Crea la tabella per tracciare tutte le transazioni del wallet
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    amount NUMERIC(10, 2) NOT NULL, -- Positivo per ricariche, negativo per spese
    type TEXT NOT NULL, -- Es: 'recharge', 'consultation_fee', 'refund'
    description TEXT,
    related_consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    metadata JSONB
);

-- Aggiungi indici per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);

-- Abilita Row Level Security
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere solo le proprie transazioni
CREATE POLICY "Users can view their own wallet transactions"
ON public.wallet_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Commenti sulla tabella per chiarezza
COMMENT ON TABLE public.wallet_transactions IS 'Registra ogni movimento di credito nel wallet di un utente.';
COMMENT ON COLUMN public.wallet_transactions.amount IS 'Importo della transazione. Positivo per accrediti, negativo per addebiti.';
COMMENT ON COLUMN public.wallet_transactions.type IS 'Tipo di transazione, es. "recharge", "consultation_fee".';
