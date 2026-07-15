-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  phone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== MEMBERS ==========
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== CATEGORIES ==========
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL
);

-- ========== TRANSACTIONS ==========
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  category_id INTEGER,
  amount REAL NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  member_id INTEGER,
  proof_image TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ========== DUES ==========
CREATE TABLE IF NOT EXISTS dues_settings (
  id SERIAL PRIMARY KEY,
  amount REAL NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dues_payments (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount REAL NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'unpaid',
  transaction_id INTEGER,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ========== SETTINGS ==========
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- ========== EVENTS ==========
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  location_address TEXT,
  location_lat REAL,
  location_lng REAL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'draft',
  target_per_person REAL DEFAULT 0,
  notes TEXT,
  bank_info TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  attendance TEXT DEFAULT 'absent',
  amount_paid REAL DEFAULT 0,
  status TEXT DEFAULT 'unpaid',
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id),
  UNIQUE(event_id, member_id)
);

CREATE TABLE IF NOT EXISTS event_rundown (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  time TEXT,
  activity TEXT NOT NULL,
  pic TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_tasks (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  task TEXT NOT NULL,
  pic TEXT,
  status TEXT DEFAULT 'pending',
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_budget (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  item TEXT NOT NULL,
  qty INTEGER DEFAULT 1,
  unit_price REAL DEFAULT 0,
  planned_amount REAL DEFAULT 0,
  actual_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_transactions (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ========== SEED DATA ==========

-- Default categories
INSERT INTO categories (id, name, type) VALUES
  (1, 'Iuran Bulanan', 'income'),
  (2, 'Sumbangan', 'income'),
  (3, 'Donasi', 'income'),
  (4, 'Iuran Event', 'income'),
  (5, 'Sponsorship', 'income'),
  (6, 'Lainnya (Masuk)', 'income'),
  (7, 'Belanja Kebutuhan', 'expense'),
  (8, 'Kegiatan/Event', 'expense'),
  (9, 'Perawatan', 'expense'),
  (10, 'Kebersihan', 'expense'),
  (11, 'Keamanan', 'expense'),
  (12, 'Sosial', 'expense'),
  (13, 'Lainnya (Keluar)', 'expense')
ON CONFLICT (id) DO NOTHING;

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('org_name', 'Kas Gang Meli'),
  ('org_address', ''),
  ('org_phone', ''),
  ('org_description', 'Sistem Manajemen Keuangan Komunitas')
ON CONFLICT (key) DO NOTHING;

-- Default admin user (password: admin123)
INSERT INTO users (id, username, password, full_name, role) VALUES
  (1, 'admin', '$2a$10$8PzkUjKEyoyWHdswFrqcyuptP0ysFXoiukMvLCW2okYkkCvaoAgXO', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Reset sequence for auto-increment IDs
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('members_id_seq', COALESCE((SELECT MAX(id) FROM members), 1));
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval('transactions_id_seq', COALESCE((SELECT MAX(id) FROM transactions), 1));
SELECT setval('dues_settings_id_seq', COALESCE((SELECT MAX(id) FROM dues_settings), 1));
SELECT setval('dues_payments_id_seq', COALESCE((SELECT MAX(id) FROM dues_payments), 1));
SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 1));
SELECT setval('event_participants_id_seq', COALESCE((SELECT MAX(id) FROM event_participants), 1));
SELECT setval('event_rundown_id_seq', COALESCE((SELECT MAX(id) FROM event_rundown), 1));
SELECT setval('event_tasks_id_seq', COALESCE((SELECT MAX(id) FROM event_tasks), 1));
SELECT setval('event_budget_id_seq', COALESCE((SELECT MAX(id) FROM event_budget), 1));
SELECT setval('event_transactions_id_seq', COALESCE((SELECT MAX(id) FROM event_transactions), 1));
