-- Rimuove la vecchia regola di sicurezza che potrebbe essere inaffidabile.
DROP POLICY IF EXISTS "Admins can manage all payout requests" ON public.payout_requests;

-- Rimuove la vecchia regola per gli operatori per evitare conflitti.
DROP POLICY IF EXISTS "Operators can view their own payout requests" ON public.payout_requests;

-- Crea una nuova regola di sicurezza per gli amministratori, molto più diretta e robusta.
-- Controlla direttamente se l'utente ha il ruolo 'admin' nella tabella dei profili.
CREATE POLICY "Admins can view and manage all requests"
  ON public.payout_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ricrea la regola per gli operatori, assicurando che possano vedere solo le proprie richieste.
CREATE POLICY "Operators can view their own requests"
  ON public.payout_requests FOR SELECT
  USING (auth.uid() = user_id);
