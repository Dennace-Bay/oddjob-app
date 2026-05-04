-- Allow anyone to submit a booking
CREATE POLICY "Public can insert bookings"
ON bookings FOR INSERT TO anon
WITH CHECK (true);

-- Allow admin to read and update all bookings
CREATE POLICY "Authenticated users can manage bookings"
ON bookings FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
