-- Function to get a user's transaction history
-- It securely fetches transactions only for the currently authenticated user.
CREATE OR REPLACE FUNCTION get_user_transaction_history()
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  transaction_type TEXT,
  amount NUMERIC,
  description TEXT,
  related_consultation_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.created_at,
    t.transaction_type,
    t.amount,
    t.description,
    t.related_consultation_id
  FROM
    public.transactions t
  JOIN
    public.wallets w ON t.wallet_id = w.id
  WHERE
    w.user_id = auth.uid()
  ORDER BY
    t.created_at DESC;
END;
$$;

-- Grant execution rights to the authenticated role
GRANT EXECUTE ON FUNCTION get_user_transaction_history() TO authenticated;
