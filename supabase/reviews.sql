CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  neighbourhood text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert reviews"
ON reviews FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Public can read approved reviews"
ON reviews FOR SELECT TO anon
USING (approved = true);

CREATE POLICY "Authenticated users can manage reviews"
ON reviews FOR ALL TO authenticated
USING (true);

GRANT INSERT ON reviews TO anon;
GRANT SELECT ON reviews TO anon;
