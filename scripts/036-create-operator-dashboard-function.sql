CREATE OR REPLACE FUNCTION get_operator_dashboard_data(operator_id_param uuid)
RETURNS TABLE(monthly_earnings numeric, consultations_count bigint, unread_messages_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (
      SELECT
        COALESCE(SUM(c.final_cost * (1 - p.commission_rate / 100.0)), 0)
      FROM
        consultations c
      JOIN
        profiles p ON c.operator_id = p.id
      WHERE
        c.operator_id = operator_id_param
        AND c.status = 'completed'
        AND c.created_at >= date_trunc('month', NOW())
        AND c.created_at < date_trunc('month', NOW()) + interval '1 month'
    ) AS monthly_earnings,
    (
      SELECT
        COUNT(*)
      FROM
        consultations
      WHERE
        operator_id = operator_id_param
        AND status = 'completed'
        AND created_at >= date_trunc('month', NOW())
        AND created_at < date_trunc('month', NOW()) + interval '1 month'
    ) AS consultations_count,
    (
      SELECT
        COUNT(*)
      FROM
        messages
      WHERE
        receiver_id = operator_id_param
        AND is_read = false
    ) AS unread_messages_count;
END;
$$ LANGUAGE plpgsql;
