-- Aggiunge le colonne necessarie per la fatturazione in tempo reale alla tabella delle consultazioni
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.operator_services(id),
ADD COLUMN IF NOT EXISTS last_billed_at timestamptz,
ADD COLUMN IF NOT EXISTS billed_duration integer NOT NULL DEFAULT 0, -- Durata già fatturata in secondi
ADD COLUMN IF NOT EXISTS termination_reason text;
