-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========== MEMBERS ==========
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========== CATEGORIES ==========
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL
);

-- ========== TRANSACTIONS ==========
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  category_id INTEGER,
  amount REAL NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  member_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ========== DUES ==========
CREATE TABLE IF NOT EXISTS dues_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  effective_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dues_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS event_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  task TEXT NOT NULL,
  pic TEXT,
  status TEXT DEFAULT 'pending',
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_budget (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ========== SEED DATA ==========

-- Default categories
INSERT OR IGNORE INTO categories (id, name, type) VALUES
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
  (13, 'Lainnya (Keluar)', 'expense');

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('org_name', 'Kas Gang Meli'),
  ('org_address', ''),
  ('org_phone', ''),
  ('org_description', 'Sistem Manajemen Keuangan Komunitas');

-- Default admin user (password: admin123)
-- bcrypt hash of 'admin123'
INSERT OR IGNORE INTO users (id, username, password, full_name, role) VALUES
  (1, 'admin', '$2a$10$8PzkUjKEyoyWHdswFrqcyuptP0ysFXoiukMvLCW2okYkkCvaoAgXO', 'Administrator', 'admin');
