-- Function to get top operators by consultation count in a given period
CREATE OR REPLACE FUNCTION get_top_operators_by_consultations(from_date timestamptz, to_date timestamptz, limit_count int)
RETURNS TABLE(operator_id uuid, full_name text, consultations_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as operator_id,
    p.full_name,
    COUNT(c.id) as consultations_count
  FROM
    profiles p
  JOIN
    consultations c ON p.id = c.operator_id
  WHERE
    p.role = 'operator' AND
    c.created_at >= from_date AND
    c.created_at <= to_date
  GROUP BY
    p.id, p.full_name
  ORDER BY
    consultations_count DESC
  LIMIT
    limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get consultation counts by category
CREATE OR REPLACE FUNCTION get_consultation_counts_by_category()
RETURNS TABLE(category text, consultation_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.category as category,
    COUNT(c.id) as consultation_count
  FROM
    consultations c
  JOIN
    profiles p ON c.operator_id = p.id
  WHERE
    p.category IS NOT NULL
  GROUP BY
    p.category
  ORDER BY
    consultation_count DESC;
END;
$$ LANGUAGE plpgsql;
