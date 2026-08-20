-- Enable RLS on services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public can read active services (used by the homepage and booking page)
CREATE POLICY "Public can read active services"
ON services FOR SELECT TO anon
USING (active = true);

-- Authenticated admin can read, insert, update, and delete all services
CREATE POLICY "Authenticated users can manage services"
ON services FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
