-- Abilita l'estensione per UUID se non già fatto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella per memorizzare i metodi di pagamento degli operatori
CREATE TABLE IF NOT EXISTS operator_payout_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL CHECK (method_type IN ('iban', 'paypal')),
    details JSONB NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indice per ricerche veloci
CREATE INDEX IF NOT EXISTS idx_operator_payout_methods_operator_id ON operator_payout_methods(operator_id);

-- Assicura che ci sia un solo metodo di default per operatore
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_default_payout_method ON operator_payout_methods(operator_id) WHERE (is_default = true);

COMMENT ON TABLE operator_payout_methods IS 'Memorizza i metodi di pagamento degli operatori (es. IBAN, PayPal).';
COMMENT ON COLUMN operator_payout_methods.details IS 'Dettagli del metodo, es. {"iban": "...", "account_holder": "..."} o {"email": "..."}.';


-- Tabella per tracciare i guadagni di ogni consulto
CREATE TABLE IF NOT EXISTS earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id),
    operator_id UUID NOT NULL REFERENCES profiles(id),
    client_id UUID NOT NULL REFERENCES profiles(id),
    total_charged NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    net_earning NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_earnings_operator_id ON earnings(operator_id);
CREATE INDEX IF NOT EXISTS idx_earnings_consultation_id ON earnings(consultation_id);

COMMENT ON TABLE earnings IS 'Log di ogni guadagno generato da un consulto.';
COMMENT ON COLUMN earnings.net_earning IS 'L''importo netto che spetta all''operatore.';


-- Tabella per le richieste di pagamento
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES profiles(id),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
    payout_method_id UUID NOT NULL REFERENCES operator_payout_methods(id),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    admin_processor_id UUID REFERENCES profiles(id),
    notes TEXT
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_operator_id ON payout_requests(operator_id);

COMMENT ON TABLE payout_requests IS 'Richieste di pagamento effettuate dagli operatori.';
COMMENT ON COLUMN payout_requests.status IS 'Stato della richiesta: in attesa, completata o rifiutata.';
COMMENT ON COLUMN payout_requests.notes IS 'Note opzionali dell''amministratore che ha processato la richiesta.';


-- Funzione e Trigger per popolare automaticamente la tabella earnings
-- Questa funzione viene eseguita quando un consulto viene segnato come 'completed'
CREATE OR REPLACE FUNCTION handle_consultation_completion()
RETURNS TRIGGER AS $$
DECLARE
    operator_commission_rate NUMERIC;
    total_charge NUMERIC;
    fee NUMERIC;
    net NUMERIC;
BEGIN
    -- Controlla se il nuovo stato è 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Recupera la commissione dell'operatore dal suo profilo
        SELECT commission_rate INTO operator_commission_rate
        FROM profiles
        WHERE id = NEW.operator_id;

        -- Se non c'è una commissione, usa un default (es. 20%)
        IF operator_commission_rate IS NULL THEN
            operator_commission_rate := 20.00;
        END IF;

        -- Calcola il totale addebitato (durata in minuti * prezzo al minuto)
        total_charge := (EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60) * NEW.price_per_minute;
        
        -- Calcola la commissione della piattaforma e il guadagno netto
        fee := total_charge * (operator_commission_rate / 100.0);
        net := total_charge - fee;

        -- Inserisce il record nella tabella earnings
        INSERT INTO earnings (consultation_id, operator_id, client_id, total_charged, commission_rate, platform_fee, net_earning)
        VALUES (NEW.id, NEW.operator_id, NEW.client_id, total_charge, operator_commission_rate, fee, net);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crea il trigger sulla tabella consultations
DROP TRIGGER IF EXISTS on_consultation_completed ON consultations;
CREATE TRIGGER on_consultation_completed
AFTER UPDATE ON consultations
FOR EACH ROW
EXECUTE FUNCTION handle_consultation_completion();
