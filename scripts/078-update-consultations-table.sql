-- Aggiunge le colonne necessarie per la fatturazione in tempo reale alla tabella delle consultazioni
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.operator_services(id),
ADD COLUMN IF NOT EXISTS last_billed_at timestamptz,
ADD COLUMN IF NOT EXISTS billed_duration integer NOT NULL DEFAULT 0, -- Durata già fatturata in secondi
ADD COLUMN IF NOT EXISTS termination_reason text;

-- Assicura che la tabella delle impostazioni abbia un valore di default per la commissione
-- Questo è un fallback nel caso in cui non sia impostata una commissione specifica per l'operatore
INSERT INTO public.app_settings (key, value, description)
SELECT 
  'default_commission_rate', 
  '30', -- Valore di default: 30%
  'Commissione di default della piattaforma in percentuale (es. 30)'
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'default_commission_rate');
