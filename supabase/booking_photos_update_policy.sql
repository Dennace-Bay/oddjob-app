-- Fix: customers could upload photos to storage but could never link them
-- back to their booking, because anon had no UPDATE grant on bookings at all.
-- Scope narrowly: only the `photos` column, and only while it's still empty,
-- so a customer can attach their own upload once but can't tamper with any
-- other booking field or overwrite photos already saved.

GRANT UPDATE (photos) ON bookings TO anon;

CREATE POLICY "Anon can attach photos to their new booking once"
ON bookings FOR UPDATE TO anon
USING (photos = '{}')
WITH CHECK (true);
