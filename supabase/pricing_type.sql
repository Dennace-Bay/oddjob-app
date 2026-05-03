-- Add pricing_type to services table
-- 'flat'   = flat fee (displayed as "From $X")
-- 'hourly' = hourly rate (displayed as "$X/hr")
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS pricing_type text NOT NULL DEFAULT 'flat'
  CHECK (pricing_type IN ('flat', 'hourly'));
