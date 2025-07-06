-- Funzione per approvare una candidatura
-- 1. Cambia lo stato della candidatura a 'approved'
-- 2. Cambia il ruolo dell'utente in 'profiles' a 'operator'
CREATE OR REPLACE FUNCTION approve_operator_application(p_application_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Aggiorna lo stato della candidatura
  UPDATE public.operator_applications
  SET status = 'approved', updated_at = now()
  WHERE id = p_application_id;

  -- Promuove l'utente a operatore
  UPDATE public.profiles
  SET role = 'operator'
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per rifiutare una candidatura
-- 1. Cambia semplicemente lo stato a 'rejected'
CREATE OR REPLACE FUNCTION reject_operator_application(p_application_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.operator_applications
  SET status = 'rejected', updated_at = now()
  WHERE id = p_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
