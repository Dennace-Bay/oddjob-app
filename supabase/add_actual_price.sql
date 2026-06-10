-- Add actual_price to bookings so admin can record the real amount charged
-- (vs estimated_price which is the estimator quote)
alter table bookings add column if not exists actual_price numeric;
