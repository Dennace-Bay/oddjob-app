-- Add photos array to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Create private storage bucket for booking photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'booking-photos',
  'booking-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Customers (anon) can upload photos
CREATE POLICY "Anon can upload booking photos"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'booking-photos');

-- Admin (authenticated) can view photos
CREATE POLICY "Authenticated can view booking photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'booking-photos');

-- Admin (authenticated) can delete photos
CREATE POLICY "Authenticated can delete booking photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'booking-photos');
