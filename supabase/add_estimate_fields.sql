-- Estimated price from the cost estimator (non-binding)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_price numeric;

-- Who is providing equipment: 'customer' or 'crew'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_provided text;
