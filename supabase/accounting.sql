-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS expenses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date NOT NULL,
  category    text NOT NULL,
  description text NOT NULL,
  amount      numeric(10,2) NOT NULL CHECK (amount > 0),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS worker_payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date         date NOT NULL,
  worker_name  text NOT NULL,
  hours_worked numeric(5,2) NOT NULL CHECK (hours_worked > 0),
  hourly_rate  numeric(5,2) NOT NULL DEFAULT 20 CHECK (hourly_rate > 0),
  paid         boolean NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE worker_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated full access" ON worker_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
