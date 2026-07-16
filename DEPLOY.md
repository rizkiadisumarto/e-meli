# Panduan Deploy ke Render.com

## Prasyarat
- Akun GitHub
- Akun Render.com (gratis)

## Langkah 1: Push ke GitHub

```bash
cd kas-gang-meli
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/kas-gang-meli.git
git push -u origin main
```

## Langkah 2: Deploy di Render.com

### 2.1 Login ke Render
1. Buka https://dashboard.render.com
2. Login dengan GitHub

### 2.2 Buat Blueprint (Recommended)
1. Klik **New +** → **Blueprint**
2. Pilih repository GitHub kamu
3. Render akan otomatis membaca `render.yaml`
4. Klik **Apply** - ini akan membuat:
   - Web Service (e-meli)
   - PostgreSQL Database (e-meli-db)

### 2.3 Atau Manual
Jika tidak pakai Blueprint:

#### Buat Database PostgreSQL:
1. Klik **New +** → **PostgreSQL**
2. Nama: `e-meli-db`
3. Plan: **Free**
4. Database: `emeli`
5. User: `emeli`
6. Klik **Create Database**
7. Copy **Internal Database URL**

#### Buat Web Service:
1. Klik **New +** → **Web Service**
2. Connect repository GitHub
3. Isi:
   - **Name**: `e-meli`
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install && cd ../client && npm install && npm run build`
   - **Start Command**: `cd server && node server.js`
4. Di **Environment Variables**:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (paste Internal Database URL dari PostgreSQL)
   - `JWT_SECRET` = (generate random string)
5. Klik **Create Web Service**

## Langkah 3: Verifikasi

1. Tunggu build selesai (~2-3 menit)
2. Buka URL yang diberikan Render (contoh: `https://e-meli.onrender.com`)
3. Login dengan:
   - Username: `admin`
   - Password: `admin123`

## Database Persistence

Data tersimpan di **PostgreSQL managed database** di Render.com, BUKAN di filesystem. Artinya:
- Data **TIDAK AKAN HILANG** saat server restart
- Data **TIDAK AKAN HILANG** saat redeploy
- Database tetap persisten meskipun service free tier

## Environment Variables

| Key | Value | Keterangan |
|-----|-------|------------|
| `NODE_ENV` | `production` | Mode production |
| `DATABASE_URL` | `postgresql://...` | URL database PostgreSQL (auto dari Render) |
| `JWT_SECRET` | (random string) | Secret untuk JWT token |

## Troubleshooting

### Build Gagal
- Pastikan `package.json` di folder `client` ada script `build`
- Pastikan dependency sudah benar

### Database Error
- Pastikan `DATABASE_URL` terisi dengan benar
- Cek log di Render Dashboard → Logs

### App Tidak Bisa Diakses
- Tunggu 1-2 menit setelah deploy (free tier cold start)
- Render free tier akan sleep setelah 15 menit tidak ada akses
