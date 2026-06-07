-- Run this in the Supabase SQL Editor

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid boolean NOT NULL DEFAULT false;
