CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'client')) DEFAULT 'client',
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE clients ADD CONSTRAINT unique_client_name UNIQUE (name);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  cost NUMERIC(12, 2),
  purchase_date DATE,
  sale_price NUMERIC(12, 2),
  sale_date DATE,
  write_off_reason TEXT,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE assets
ADD COLUMN useful_life INTEGER DEFAULT 5,
ADD COLUMN depreciation_start DATE,
ADD COLUMN depreciation_method TEXT DEFAULT 'straight_line',
ADD COLUMN accumulated_depreciation NUMERIC(12,2) DEFAULT 0;
