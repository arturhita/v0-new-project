-- Funzione per incrementare i voti utili in modo atomico e sicuro
CREATE OR REPLACE FUNCTION increment_helpful_votes(review_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.reviews
  SET helpful_votes = helpful_votes + 1
  WHERE id = review_id_param;
END;
$$ LANGUAGE plpgsql;
