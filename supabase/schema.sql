-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text          NOT NULL,
  description       text          NOT NULL,
  icon              text          NOT NULL,
  base_price        numeric(10,2) NOT NULL,
  duration_estimate text          NOT NULL,
  active            boolean       NOT NULL DEFAULT true,
  created_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name  text        NOT NULL,
  email          text        NOT NULL,
  phone          text        NOT NULL,
  service_id     uuid        NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  address        text        NOT NULL,
  preferred_date date        NOT NULL,
  preferred_time text        NOT NULL,
  notes          text,
  status         text        NOT NULL DEFAULT 'pending',
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Seed: services
-- ============================================================

INSERT INTO services (name, description, icon, base_price, duration_estimate) VALUES
  (
    'Junk Removal',
    'We haul away furniture, appliances, and general clutter — you point, we load.',
    '🗑️',
    120.00,
    '1–3 hours'
  ),
  (
    'Yard Work',
    'Lawn mowing, weeding, leaf raking, and general yard tidy-ups.',
    '🌿',
    80.00,
    '1–4 hours'
  ),
  (
    'Fence Painting',
    'Fresh coat of paint or stain on wood, vinyl, or metal fencing.',
    '🎨',
    150.00,
    '2–6 hours'
  ),
  (
    'Small Apartment Move',
    'Loading, transport, and unloading for studio or one-bedroom apartments.',
    '📦',
    250.00,
    '3–5 hours'
  ),
  (
    'TV Mounting',
    'Wall-mount your TV with cable management — any size, any wall type.',
    '📺',
    75.00,
    '1–2 hours'
  ),
  (
    'General Labour',
    'Odd jobs, assembly, carrying, or anything that needs an extra pair of hands.',
    '🔧',
    60.00,
    '1–8 hours'
  );
