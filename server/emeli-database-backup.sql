-- ============================================
-- Database Dump: e-meli-db (Render PostgreSQL)
-- Tanggal: 2026-07-19T08:31:02.252Z
-- ============================================

-- Tabel: categories (13 baris)
DROP TABLE IF EXISTS "categories" CASCADE;
CREATE TABLE IF NOT EXISTS "categories" (
  "id" integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  "name" character varying(255) NOT NULL,
  "type" character varying(50) NOT NULL
);

INSERT INTO "categories" ("id", "name", "type") VALUES (1, 'Iuran Bulanan', 'income');
INSERT INTO "categories" ("id", "name", "type") VALUES (2, 'Sumbangan', 'income');
INSERT INTO "categories" ("id", "name", "type") VALUES (3, 'Donasi', 'income');
INSERT INTO "categories" ("id", "name", "type") VALUES (4, 'Iuran Event', 'income');
INSERT INTO "categories" ("id", "name", "type") VALUES (5, 'Sponsorship', 'income');
INSERT INTO "categories" ("id", "name", "type") VALUES (6, 'Lainnya (Masuk)', 'income');
INSERT INTO "categories" ("id", "name", "type") VALUES (7, 'Belanja Kebutuhan', 'expense');
INSERT INTO "categories" ("id", "name", "type") VALUES (8, 'Kegiatan/Event', 'expense');
INSERT INTO "categories" ("id", "name", "type") VALUES (9, 'Perawatan', 'expense');
INSERT INTO "categories" ("id", "name", "type") VALUES (10, 'Kebersihan', 'expense');
INSERT INTO "categories" ("id", "name", "type") VALUES (11, 'Keamanan', 'expense');
INSERT INTO "categories" ("id", "name", "type") VALUES (12, 'Sosial', 'expense');
INSERT INTO "categories" ("id", "name", "type") VALUES (13, 'Lainnya (Keluar)', 'expense');

SELECT setval('public.categories_id_seq', COALESCE((SELECT MAX(id) FROM "categories"), 1));

-- Tabel: dues_payments (0 baris)
DROP TABLE IF EXISTS "dues_payments" CASCADE;
CREATE TABLE IF NOT EXISTS "dues_payments" (
  "id" integer NOT NULL DEFAULT nextval('dues_payments_id_seq'::regclass),
  "member_id" integer NOT NULL,
  "month" integer NOT NULL,
  "year" integer NOT NULL,
  "amount" numeric NOT NULL,
  "paid_date" date,
  "status" character varying(50) DEFAULT 'unpaid'::character varying,
  "transaction_id" integer
);


-- Tabel: dues_settings (1 baris)
DROP TABLE IF EXISTS "dues_settings" CASCADE;
CREATE TABLE IF NOT EXISTS "dues_settings" (
  "id" integer NOT NULL DEFAULT nextval('dues_settings_id_seq'::regclass),
  "amount" numeric NOT NULL,
  "period" character varying(50) NOT NULL DEFAULT 'monthly'::character varying,
  "effective_date" date NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "dues_settings" ("id", "amount", "period", "effective_date", "created_at") VALUES (1, '50000.00', 'monthly', '2026-07-15T17:00:00.000Z', '2026-07-16T07:01:42.565Z');

SELECT setval('public.dues_settings_id_seq', COALESCE((SELECT MAX(id) FROM "dues_settings"), 1));

-- Tabel: event_budget (36 baris)
DROP TABLE IF EXISTS "event_budget" CASCADE;
CREATE TABLE IF NOT EXISTS "event_budget" (
  "id" integer NOT NULL DEFAULT nextval('event_budget_id_seq'::regclass),
  "event_id" integer NOT NULL,
  "item" text NOT NULL,
  "qty" integer DEFAULT 1,
  "unit_price" numeric DEFAULT 0,
  "planned_amount" numeric DEFAULT 0,
  "actual_amount" numeric DEFAULT 0,
  "status" character varying(50) DEFAULT 'pending'::character varying,
  "sort_order" integer DEFAULT 0
);

INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (2, 1, 'BANNER UKURAN 3X2', 1, '84000.00', '84000.00', '84000.00', 'done', NULL);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (3, 1, 'TEMPELAN PIPI 4 LEMBAR', 1, '15400.00', '15400.00', '15400.00', 'done', NULL);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (6, 1, 'SOUVENIR TUMBLER KOPI 27 PCS', 1, '131956.00', '131956.00', '131956.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (5, 1, 'SOUVENIR  TOPI MERAH 27 PCS', 1, '188085.00', '188085.00', '188085.00', 'done', NULL);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (7, 1, 'SOUVENIR SPUNDBOND 27 PCS', 1, '28215.00', '28215.00', '28215.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (8, 1, 'HADIAH ANAK BUKU GAMBAR 10 PCS', 1, '17040.00', '17040.00', '17040.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (9, 1, 'HADIAH ANAK CELENGAN 14 PCS', 1, '49808.00', '49808.00', '49808.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (10, 1, 'HADIAH ANAK SET ALAT TULIS 40 PCS', 1, '76860.00', '76860.00', '76860.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (11, 1, 'HADIAH ANAK TEMPAT PENSIL 39 PCS', 1, '106507.00', '106507.00', '106507.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (12, 1, 'KERTAS BUNGKUS COKLAT 20 LEMBAR', 1, '22850.00', '22850.00', '22850.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (13, 1, 'HADIAH ANAK BUKU TULIS 1 PAK', 1, '22990.00', '22990.00', '22990.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (14, 1, 'HADIAH ORANG TUA JAM TANGAN 4 PCS', 1, '46680.00', '46680.00', '46680.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (15, 1, 'HADIAH ORANG TUA PIRING MANGKOK 24 PCS', 1, '35610.00', '35610.00', '35610.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (16, 1, 'HADIAH ORANG TUA TUMBLER POLOS 20 PCS', 1, '107840.00', '107840.00', '107840.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (17, 1, 'HADIAH ORANG TUA PANCI 10 PCS', 1, '74705.00', '74705.00', '74705.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (18, 1, 'BALON 100 PCS', 1, '26399.00', '26399.00', '26399.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (19, 1, 'DOORPRIZE JAM DINDING 3 PCS', 1, '63042.00', '63042.00', '63042.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (20, 1, 'DOORPRIZE TEA POT SET 3 PCS', 1, '67264.00', '67264.00', '67264.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (21, 1, 'DOORPRIZE PISAU SET 3 PCS', 1, '54291.00', '54291.00', '54291.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (22, 1, 'DOORPRIZE DISPENSER BERAS 2 PCS', 1, '74926.00', '74926.00', '74926.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (23, 1, 'DOORPRIZE TIMBANGAN BADAN 1 PCS', 1, '39042.00', '39042.00', '39042.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (24, 1, 'DOORPRIZE KIPAS ANGIN KARAKTER 1 PCS', 1, '53434.00', '53434.00', '53434.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (25, 1, 'DOORPRIZE BOTOL MINYAK 2 PCS', 1, '14400.00', '14400.00', '14400.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (26, 1, 'BAMBU 20 PCS', 1, '200000.00', '200000.00', '200000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (27, 1, 'TAHU UNTUK PENTOL', 1, '50000.00', '50000.00', '50000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (28, 1, 'BUNGKUS KADO', 1, '20000.00', '20000.00', '20000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (29, 1, 'HADIAH ANAK KACAMATA ANAK 3PCS', 1, '9516.00', '9516.00', '9516.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (30, 1, 'UMBUL UMBUL', 1, '120000.00', '120000.00', '120000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (31, 1, 'AIR MINERAL 4 DUS KERJA BAKTI PERSIAPAN 17 AN', 1, '112000.00', '112000.00', '112000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (32, 1, 'KOPI 3 RENCENG UNTUK KERJA BAKTI PERSIAPAN 17 AN', 1, '54000.00', '54000.00', '54000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (33, 1, 'KOPI 3 RENCENG+ 2 DUS AIR MINERAL (Ambil dulu di ADAM)', 1, '92000.00', '92000.00', '92000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (34, 1, 'UNTUK TAMBAHAN 10 PAKET SNACK', 1, '132000.00', '132000.00', '132000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (35, 1, 'KELERENG', 1, '10000.00', '10000.00', '10000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (36, 1, 'PLASTIK BUAT LOMBA', 1, '10000.00', '10000.00', '10000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (37, 1, 'AIR MINERAL ISI ULANG GALON', 1, '27000.00', '27000.00', '27000.00', 'pending', 0);
INSERT INTO "event_budget" ("id", "event_id", "item", "qty", "unit_price", "planned_amount", "actual_amount", "status", "sort_order") VALUES (4, 1, 'SOUVENIR LUNCH BOX 27 PCS', 1, '126996.00', '126996.00', '126996.00', 'done', NULL);

SELECT setval('public.event_budget_id_seq', COALESCE((SELECT MAX(id) FROM "event_budget"), 1));

-- Tabel: event_participants (46 baris)
DROP TABLE IF EXISTS "event_participants" CASCADE;
CREATE TABLE IF NOT EXISTS "event_participants" (
  "id" integer NOT NULL DEFAULT nextval('event_participants_id_seq'::regclass),
  "event_id" integer NOT NULL,
  "member_id" integer NOT NULL,
  "attendance" character varying(50) DEFAULT 'absent'::character varying,
  "amount_paid" numeric DEFAULT 0,
  "status" character varying(50) DEFAULT 'unpaid'::character varying
);

INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (21, 1, 9, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (22, 1, 4, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (19, 1, 24, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (4, 1, 14, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (25, 1, 20, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (3, 1, 11, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (20, 1, 13, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (2, 1, 12, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (1, 1, 6, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (5, 1, 8, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (6, 1, 21, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (7, 1, 16, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (8, 1, 23, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (9, 1, 7, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (10, 1, 3, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (11, 1, 17, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (12, 1, 5, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (13, 1, 19, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (14, 1, 18, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (15, 1, 22, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (16, 1, 1, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (17, 1, 15, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (18, 1, 10, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (44, 2, 9, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (45, 2, 4, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (47, 2, 14, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (48, 2, 11, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (51, 2, 12, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (57, 2, 3, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (60, 2, 5, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (61, 2, 19, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (63, 2, 22, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (64, 2, 1, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (65, 2, 15, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (52, 2, 6, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (56, 2, 23, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (62, 2, 18, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (46, 2, 24, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (59, 2, 17, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (54, 2, 21, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (50, 2, 13, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (55, 2, 16, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (53, 2, 8, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (49, 2, 20, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (66, 2, 10, 'present', '0.00', 'paid');
INSERT INTO "event_participants" ("id", "event_id", "member_id", "attendance", "amount_paid", "status") VALUES (58, 2, 7, 'present', '0.00', 'paid');

SELECT setval('public.event_participants_id_seq', COALESCE((SELECT MAX(id) FROM "event_participants"), 1));

-- Tabel: event_rundown (0 baris)
DROP TABLE IF EXISTS "event_rundown" CASCADE;
CREATE TABLE IF NOT EXISTS "event_rundown" (
  "id" integer NOT NULL DEFAULT nextval('event_rundown_id_seq'::regclass),
  "event_id" integer NOT NULL,
  "time" character varying(50),
  "activity" text NOT NULL,
  "pic" text,
  "notes" text,
  "status" character varying(50) DEFAULT 'pending'::character varying,
  "sort_order" integer DEFAULT 0
);


-- Tabel: event_tasks (6 baris)
DROP TABLE IF EXISTS "event_tasks" CASCADE;
CREATE TABLE IF NOT EXISTS "event_tasks" (
  "id" integer NOT NULL DEFAULT nextval('event_tasks_id_seq'::regclass),
  "event_id" integer NOT NULL,
  "task" text NOT NULL,
  "pic" text,
  "status" character varying(50) DEFAULT 'pending'::character varying,
  "sort_order" integer DEFAULT 0
);

INSERT INTO "event_tasks" ("id", "event_id", "task", "pic", "status", "sort_order") VALUES (1, 1, 'Pembina', 'Bapak Hairul', 'done', NULL);
INSERT INTO "event_tasks" ("id", "event_id", "task", "pic", "status", "sort_order") VALUES (2, 1, 'Ketua Panitia', 'Bapak Arief', 'done', NULL);
INSERT INTO "event_tasks" ("id", "event_id", "task", "pic", "status", "sort_order") VALUES (4, 1, 'Sekretaris', 'Bapak Yusuf', 'done', NULL);
INSERT INTO "event_tasks" ("id", "event_id", "task", "pic", "status", "sort_order") VALUES (7, 2, 'Sekretaris', 'Bapak Yusuf', 'done', NULL);
INSERT INTO "event_tasks" ("id", "event_id", "task", "pic", "status", "sort_order") VALUES (6, 2, 'Ketua Panitia', 'Bapak Arief', 'done', NULL);
INSERT INTO "event_tasks" ("id", "event_id", "task", "pic", "status", "sort_order") VALUES (5, 2, 'Pembina', 'Bapak Hairul', 'done', NULL);

SELECT setval('public.event_tasks_id_seq', COALESCE((SELECT MAX(id) FROM "event_tasks"), 1));

-- Tabel: event_transactions (78 baris)
DROP TABLE IF EXISTS "event_transactions" CASCADE;
CREATE TABLE IF NOT EXISTS "event_transactions" (
  "id" integer NOT NULL DEFAULT nextval('event_transactions_id_seq'::regclass),
  "event_id" integer NOT NULL,
  "transaction_id" integer NOT NULL
);

INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (13, 1, 15);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (14, 1, 16);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (15, 1, 17);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (16, 1, 18);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (17, 1, 19);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (18, 1, 20);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (19, 1, 21);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (20, 1, 22);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (21, 1, 23);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (22, 1, 24);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (23, 1, 25);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (24, 1, 26);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (25, 1, 27);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (26, 1, 28);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (27, 1, 29);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (28, 1, 30);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (29, 1, 31);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (30, 1, 32);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (31, 1, 33);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (32, 1, 34);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (33, 1, 35);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (34, 1, 36);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (35, 1, 37);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (36, 1, 38);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (37, 1, 39);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (38, 1, 40);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (39, 1, 41);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (40, 1, 42);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (41, 1, 43);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (42, 1, 44);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (43, 1, 45);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (44, 1, 46);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (45, 1, 47);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (46, 1, 48);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (47, 1, 49);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (48, 1, 50);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (49, 1, 51);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (50, 1, 52);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (51, 1, 53);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (52, 1, 54);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (53, 1, 55);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (54, 1, 56);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (55, 1, 57);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (56, 1, 58);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (57, 1, 59);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (58, 1, 60);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (59, 1, 61);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (60, 1, 62);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (61, 1, 63);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (62, 1, 64);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (63, 1, 65);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (64, 1, 66);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (65, 1, 67);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (66, 1, 68);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (67, 1, 69);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (68, 1, 70);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (69, 1, 71);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (70, 1, 72);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (71, 1, 73);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (72, 1, 74);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (73, 1, 75);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (74, 1, 76);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (75, 1, 77);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (76, 1, 78);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (77, 2, 79);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (78, 2, 80);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (79, 2, 81);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (80, 2, 82);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (81, 2, 83);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (82, 2, 84);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (83, 2, 85);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (84, 2, 86);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (85, 2, 87);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (86, 2, 88);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (87, 2, 89);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (88, 2, 90);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (89, 2, 91);
INSERT INTO "event_transactions" ("id", "event_id", "transaction_id") VALUES (90, 2, 92);

SELECT setval('public.event_transactions_id_seq', COALESCE((SELECT MAX(id) FROM "event_transactions"), 1));

-- Tabel: events (2 baris)
DROP TABLE IF EXISTS "events" CASCADE;
CREATE TABLE IF NOT EXISTS "events" (
  "id" integer NOT NULL DEFAULT nextval('events_id_seq'::regclass),
  "name" character varying(255) NOT NULL,
  "description" text,
  "location_name" text,
  "location_address" text,
  "location_lat" numeric,
  "location_lng" numeric,
  "start_date" date NOT NULL,
  "end_date" date,
  "status" character varying(50) DEFAULT 'draft'::character varying,
  "target_per_person" numeric DEFAULT 0,
  "notes" text,
  "bank_info" text,
  "created_by" integer,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "events" ("id", "name", "description", "location_name", "location_address", "location_lat", "location_lng", "start_date", "end_date", "status", "target_per_person", "notes", "bank_info", "created_by", "created_at") VALUES (1, '17an Gang Melimewah 2025', 'Acara Untuk memperingati Hari Lahirnya Bangsa Indonesia Bersama Keluarga Gang Melimewah Tercinta❤️', 'Gang Melimewah', 'Wisma Asri Cibening, Cibening, Setu Kab. Bekasi', '-6.35359567', '107.05917622', '2025-08-16T17:00:00.000Z', '2025-08-16T17:00:00.000Z', 'completed', '0.00', 'Terimakasih banyak untuk seluruh panitia acara dan semua donatur dalam mensupport kegiatan perayaan HUT RI ke-80 tahun 2025. Semoga tenaga dan rezeki yang sudah di keluarkan di ganti oleh gusti Allah dengan keberkahan yang melimpah.', NULL, 1, '2026-07-16T06:57:54.729Z');
INSERT INTO "events" ("id", "name", "description", "location_name", "location_address", "location_lat", "location_lng", "start_date", "end_date", "status", "target_per_person", "notes", "bank_info", "created_by", "created_at") VALUES (2, 'Malam Tirakat Agustus 2025', 'Malam Sebelum Dirgahayu RI Ke-80 Bersilaturahmi dan Berdoa Dengan Hikmat Untuk Mengenang Jasa-jasa Seluruh Pahlawan Bangsa', 'Gang Melimewah', 'Wisma Asri Cibening, Cibening, Setu Kab. Bekasi', '-6.35359567', '107.05917622', '2025-08-15T17:00:00.000Z', '2025-08-15T17:00:00.000Z', 'completed', '0.00', '', NULL, 1, '2026-07-17T04:11:49.971Z');

SELECT setval('public.events_id_seq', COALESCE((SELECT MAX(id) FROM "events"), 1));

-- Tabel: members (23 baris)
DROP TABLE IF EXISTS "members" CASCADE;
CREATE TABLE IF NOT EXISTS "members" (
  "id" integer NOT NULL DEFAULT nextval('members_id_seq'::regclass),
  "name" character varying(255) NOT NULL,
  "address" text,
  "phone" character varying(50),
  "status" character varying(50) DEFAULT 'active'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (1, 'Keluarga Bapak Ungguh', 'D1/1', '', 'active', '2026-07-16T07:00:00.895Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (3, 'Keluarga Bapak Maman', 'D1/2', '', 'active', '2026-07-17T03:07:28.429Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (4, 'Keluarga Bapak Andri', 'D1/3A', '', 'active', '2026-07-17T03:08:05.154Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (5, 'Keluarga Bapak Raman', 'D1/5', '', 'active', '2026-07-17T03:08:44.983Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (6, 'Keluarga Bapak Fachrudin', 'D1/8', '', 'active', '2026-07-17T03:09:17.641Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (7, 'Keluarga Bapak Luki', 'D1/9', '', 'active', '2026-07-17T03:10:02.144Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (8, 'Keluarga Bapak Hairul', 'D1/10', '', 'active', '2026-07-17T03:10:25.784Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (9, 'Keluarga Bapak Agung', 'D1/12', '', 'active', '2026-07-17T03:10:50.155Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (10, 'Keluarga Bapak Yusuf', 'D1/12A', '', 'active', '2026-07-17T03:11:36.545Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (11, 'Keluarga Bapak Benny', 'D1/15', '', 'active', '2026-07-17T03:11:58.434Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (12, 'Keluarga Bapak Danu', 'D1/16', '', 'active', '2026-07-17T03:12:28.694Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (13, 'Keluarga Bapak Danang', 'E1/1', '', 'active', '2026-07-17T03:13:03.358Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (14, 'Keluarga Bapak Aziz', 'E1/5', '', 'active', '2026-07-17T03:14:46.575Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (15, 'Keluarga Bapak Untung', 'E1/6', '', 'active', '2026-07-17T03:15:08.141Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (16, 'Keluarga Bapak Helmi', 'E1/7', '', 'active', '2026-07-17T03:15:27.632Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (17, 'Keluarga Bapak Nurali', 'E1/8', '', 'active', '2026-07-17T03:15:55.864Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (18, 'Keluarga Bapak Sigit', 'E1/9', '', 'active', '2026-07-17T03:16:31.438Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (19, 'Keluarga Bapak Rizki', 'E2/3', '', 'active', '2026-07-17T03:16:53.421Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (20, 'Keluarga Bapak Bambang', 'E2/5', '', 'active', '2026-07-17T03:17:11.603Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (21, 'Keluarga Bapak Hakim', 'E2/6', '', 'active', '2026-07-17T03:17:31.714Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (22, 'Keluarga Bapak Supri', 'E2/7', '', 'active', '2026-07-17T03:17:53.350Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (23, 'Keluarga Bapak Isroni', 'E2/8', '', 'active', '2026-07-17T03:18:16.078Z');
INSERT INTO "members" ("id", "name", "address", "phone", "status", "created_at") VALUES (24, 'Keluarga Bapak Arief', 'E2/10', '', 'active', '2026-07-17T03:18:33.456Z');

SELECT setval('public.members_id_seq', COALESCE((SELECT MAX(id) FROM "members"), 1));

-- Tabel: settings (4 baris)
DROP TABLE IF EXISTS "settings" CASCADE;
CREATE TABLE IF NOT EXISTS "settings" (
  "key" character varying(255) NOT NULL,
  "value" text
);

INSERT INTO "settings" ("key", "value") VALUES ('org_name', 'Kas Gang Meli');
INSERT INTO "settings" ("key", "value") VALUES ('org_address', '');
INSERT INTO "settings" ("key", "value") VALUES ('org_phone', '');
INSERT INTO "settings" ("key", "value") VALUES ('org_description', 'Sistem Manajemen Keuangan Komunitas');


-- Tabel: transactions (78 baris)
DROP TABLE IF EXISTS "transactions" CASCADE;
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" integer NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
  "type" character varying(50) NOT NULL,
  "category_id" integer,
  "amount" numeric NOT NULL,
  "description" text,
  "date" date NOT NULL,
  "member_id" integer,
  "proof_image" text,
  "created_by" integer,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (62, 'expense', 8, '22850.00', 'KERTAS COKLAT 20 LEMBAR', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T02:57:20.493Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (16, 'expense', 8, '15400.00', 'TEMPELAN PIPI', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:26:00.174Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (17, 'expense', 8, '126996.00', 'LUNCH BOX 27 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:26:58.129Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (19, 'expense', 8, '131956.00', 'TUMBLER KOPI 27 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:30:10.822Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (20, 'expense', 8, '28215.00', 'SPUNDBOND 27 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:30:57.826Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (21, 'expense', 8, '17040.00', 'BUKU GAMBAR 10 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:31:50.956Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (22, 'expense', 8, '49808.00', 'CELENGAN 14 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:32:36.794Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (18, 'expense', 8, '188085.00', 'TOPI MERAH 27 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:29:15.521Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (23, 'expense', 8, '76860.00', 'SET ALAT TULIS 40 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:33:02.358Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (24, 'expense', 8, '106507.00', 'TEMPAT PENSIL 39 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:34:35.599Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (25, 'expense', 8, '22990.00', 'BUKU TULIS 1 PAK', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:37:30.391Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (27, 'expense', 8, '35610.00', 'PIRING MANGKOK 24 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:38:53.972Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (63, 'income', 3, '0.00', 'ES KRIM', '2025-08-16T17:00:00.000Z', 14, NULL, 1, '2026-07-17T03:20:23.372Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (29, 'expense', 8, '74705.00', 'PANCI 10 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:40:10.343Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (28, 'expense', 8, '107840.00', 'TUMBLER POLOS 20 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:39:19.811Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (30, 'expense', 8, '26399.00', 'BALON 100 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:40:59.367Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (33, 'expense', 8, '54291.00', 'PISAU SET 3 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:44:17.364Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (26, 'expense', 8, '46680.00', 'JAM TANGAN 4 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:38:04.600Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (32, 'expense', 8, '67264.00', 'TEA POT SET 3 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:43:38.995Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (35, 'expense', 8, '39042.00', 'TIMBANGAN BADAN 1 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:46:03.582Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (36, 'expense', 8, '53434.00', 'KIPAS ANGIN KARAKTER 1 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:46:28.280Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (37, 'expense', 8, '14400.00', 'BOTOL MINYAK 2 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:46:58.332Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (38, 'expense', 8, '200000.00', 'BAMBU 20 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:48:10.298Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (39, 'expense', 8, '50000.00', 'TAHU UNTUK PENTOL', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:48:37.319Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (31, 'expense', 8, '63042.00', 'JAM DINDING 3 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:43:22.758Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (64, 'income', 3, '0.00', 'Susu UHT', '2025-08-16T17:00:00.000Z', 12, NULL, 1, '2026-07-17T03:20:49.341Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (40, 'expense', 8, '20000.00', 'BUNGKUS KADO', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:49:25.476Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (41, 'expense', 8, '9516.00', 'KACAMATA ANAK 3PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:50:32.865Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (42, 'expense', 8, '120000.00', 'UMBUL UMBUL', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:50:56.437Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (43, 'expense', 8, '112000.00', 'AIR MINERAL 4 DUS KERJA BAKTI PERSIAPAN 17 AN', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:51:20.668Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (44, 'expense', 8, '54000.00', 'KOPI 3 RENCENG UNTUK KERJA BAKTI PERSIAPAN 17 AN', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:51:52.490Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (45, 'expense', 8, '92000.00', 'KOPI 3 RENCENG+ 2 DUS AIR MINERAL (Ambil dulu di ADAM)', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:52:24.337Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (46, 'expense', 8, '132000.00', 'UNTUK TAMBAHAN 10 PAKET SNACK', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:52:42.667Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (47, 'expense', 8, '10000.00', 'KELERENG', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:53:16.175Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (48, 'expense', 8, '10000.00', 'PLASTIK BUAT LOMBA', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:53:47.342Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (49, 'expense', 8, '27000.00', 'AIR MINERAL ISI ULANG GALON', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:54:11.281Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (34, 'expense', 8, '74926.00', 'DISPENSER BERAS 2 PCS', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:45:27.459Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (50, 'income', 3, '500000.00', 'UANG KAS', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:57:03.728Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (15, 'expense', 8, '84000.00', 'BANNER', '2025-08-10T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:24:12.012Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (51, 'income', 3, '500000.00', 'Bapak Hairul', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:57:58.688Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (52, 'income', 3, '200000.00', 'Bapak Maman', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:58:41.310Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (53, 'income', 3, '100000.00', 'Bapak Benny', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:59:27.654Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (82, 'income', 3, '0.00', 'Gorengan Mix & Beras 5kg', '2025-08-15T17:00:00.000Z', 24, NULL, 1, '2026-07-17T04:20:36.289Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (56, 'income', 3, '150000.00', 'Bapak Hakim', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T02:01:01.735Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (57, 'income', 3, '100000.00', 'Bapk Helmi', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T02:01:39.971Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (58, 'income', 3, '150000.00', 'Bapak Sigit', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T02:02:08.628Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (59, 'income', 3, '100000.00', 'Bapak Bambang', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T02:02:53.008Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (60, 'income', 3, '100000.00', 'Bapak Lulu', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T02:03:21.760Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (55, 'income', 3, '200000.00', 'Bapak Agung', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T02:00:34.408Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (61, 'income', 3, '100000.00', 'Bapak Andri', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T02:07:08.191Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (65, 'income', 3, '0.00', 'Kaos Polo Paperone 16pcs', '2025-08-16T17:00:00.000Z', 11, NULL, 1, '2026-07-17T03:22:02.473Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (66, 'income', 3, '0.00', 'Donat Mini 5 Lusin', '2025-08-16T17:00:00.000Z', 1, NULL, 1, '2026-07-17T03:22:47.408Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (67, 'income', 3, '0.00', '50 Bungkus Snack', '2025-08-16T17:00:00.000Z', 13, NULL, 1, '2026-07-17T03:23:45.288Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (68, 'income', 3, '0.00', 'Voucher Indomaret @100rb', '2025-08-16T17:00:00.000Z', 7, NULL, 1, '2026-07-17T03:25:02.830Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (70, 'income', 3, '0.00', 'Pentol Bakso', '2025-08-16T17:00:00.000Z', 8, NULL, 1, '2026-07-17T03:26:12.964Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (69, 'income', 3, '0.00', '2 Lusin Buku Tulis Anak', '2025-08-16T17:00:00.000Z', 7, NULL, 1, '2026-07-17T03:25:41.727Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (73, 'income', 3, '0.00', 'Kacamata Anak 10Pcs', '2025-08-16T17:00:00.000Z', 10, NULL, 1, '2026-07-17T03:28:20.364Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (72, 'income', 3, '0.00', 'Spon Cuci Piring 5Pcs', '2025-08-16T17:00:00.000Z', 10, NULL, 1, '2026-07-17T03:27:35.273Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (74, 'income', 3, '0.00', 'Setrika 1Pcs', '2025-08-16T17:00:00.000Z', 24, NULL, 1, '2026-07-17T03:31:43.096Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (75, 'income', 3, '0.00', 'Dispenser 1Pcs', '2025-08-16T17:00:00.000Z', 24, NULL, 1, '2026-07-17T03:32:32.143Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (71, 'income', 3, '0.00', 'Sajadah Travel 10Pcs', '2025-08-16T17:00:00.000Z', 10, NULL, 1, '2026-07-17T03:27:03.152Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (76, 'income', 3, '0.00', 'So Klin 2Pack', '2025-08-16T17:00:00.000Z', 23, NULL, 1, '2026-07-17T03:34:03.306Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (83, 'income', 3, '0.00', 'Nasi', '2025-08-15T17:00:00.000Z', 17, NULL, 1, '2026-07-17T04:21:36.378Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (54, 'income', 3, '100000.00', 'Bapak Isroni', '2025-08-09T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T01:59:54.866Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (77, 'income', 3, '0.00', 'Teh Racik Solo', '2025-08-16T17:00:00.000Z', 24, NULL, 1, '2026-07-17T03:35:32.957Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (78, 'income', 3, '0.00', 'ES Batu', '2025-08-16T17:00:00.000Z', 6, NULL, 1, '2026-07-17T03:36:09.901Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (79, 'income', 3, '0.00', 'Mie Goreng', '2025-08-15T17:00:00.000Z', 6, NULL, 1, '2026-07-17T04:18:07.998Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (80, 'income', 3, '0.00', 'Minyak Goreng', '2025-08-15T17:00:00.000Z', 23, NULL, 1, '2026-07-17T04:19:01.146Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (81, 'income', 3, '0.00', 'Nugget & Sosis', '2025-08-15T17:00:00.000Z', 18, NULL, 1, '2026-07-17T04:19:55.593Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (84, 'income', 3, '0.00', 'Nasi', '2025-08-15T17:00:00.000Z', 21, NULL, 1, '2026-07-17T04:22:36.947Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (85, 'income', 3, '0.00', 'Aqua gelas 2Dus', '2025-08-15T17:00:00.000Z', 13, NULL, 1, '2026-07-17T04:23:34.335Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (86, 'income', 3, '0.00', 'Tempe Orek', '2025-08-15T17:00:00.000Z', 16, NULL, 1, '2026-07-17T04:23:58.454Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (87, 'income', 3, '0.00', 'Telur Dadar', '2025-08-15T17:00:00.000Z', 8, NULL, 1, '2026-07-17T04:24:39.876Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (88, 'income', 3, '0.00', 'Ayam Goreng 4kg', '2025-08-15T17:00:00.000Z', 20, NULL, 1, '2026-07-17T04:25:57.495Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (89, 'income', 3, '0.00', 'Sambal & Kerupuk', '2025-08-15T17:00:00.000Z', 10, NULL, 1, '2026-07-17T04:26:39.871Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (91, 'income', 3, '0.00', 'Ayam Rica-rica', '2025-08-15T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T04:29:23.617Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (92, 'income', 3, '0.00', 'Tumis Teri Daun Singkong- Dari Keluarga Bude', '2025-08-15T17:00:00.000Z', NULL, NULL, 1, '2026-07-17T04:29:58.773Z');
INSERT INTO "transactions" ("id", "type", "category_id", "amount", "description", "date", "member_id", "proof_image", "created_by", "created_at") VALUES (90, 'income', 3, '0.00', 'Buah-buahan', '2025-08-15T17:00:00.000Z', 7, NULL, 1, '2026-07-17T04:27:45.197Z');

SELECT setval('public.transactions_id_seq', COALESCE((SELECT MAX(id) FROM "transactions"), 1));

-- Tabel: users (2 baris)
DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE IF NOT EXISTS "users" (
  "id" integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "username" character varying(255) NOT NULL,
  "password" text NOT NULL,
  "full_name" character varying(255) NOT NULL,
  "role" character varying(50) DEFAULT 'viewer'::character varying,
  "phone" character varying(50),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "users" ("id", "username", "password", "full_name", "role", "phone", "created_at") VALUES (1, 'admin', '$2a$10$8PzkUjKEyoyWHdswFrqcyuptP0ysFXoiukMvLCW2okYkkCvaoAgXO', 'Administrator', 'admin', NULL, '2026-07-16T06:22:39.540Z');
INSERT INTO "users" ("id", "username", "password", "full_name", "role", "phone", "created_at") VALUES (2, 'E2/3', '$2a$10$OgBgnIR.A2XHW/tIsymNG.0eA93tGiP3r6JG6i9wLA2kt6bCLBrPi', 'Pak Rizki', 'user', NULL, '2026-07-16T07:01:12.826Z');

SELECT setval('public.users_id_seq', COALESCE((SELECT MAX(id) FROM "users"), 1));

