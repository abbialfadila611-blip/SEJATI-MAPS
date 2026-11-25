# Panduan Menjalankan Backend PHP & Pengujian Koneksi MySQL di Laragon

## 1. Persiapan Laragon & Database
1. Buka aplikasi **Laragon**, lalu klik **Start All** untuk menjalankan **Apache/Nginx** dan **MySQL** (port default `3306`).
2. Buka **phpMyAdmin** (`http://localhost/phpmyadmin`), dan pastikan database **`sejati_maps`** beserta 9 tabelnya sudah tersedia.
   - Jika nama database di phpMyAdmin Anda menggunakan spasi atau port MySQL berbeda dari `3306`, sesuaikan pada file konfigurasi terpisah:
     `backend-php/config/db_config.php`
3. Tempatkan folder proyek pada root web Laragon, misalnya:
   `C:\laragon\www\sejati-maps\`

## 2. Menguji Endpoint Koneksi Database
Buka browser atau gunakan `curl` menuju salah satu URL berikut:
- Langsung ke file PHP (tidak memerlukan `mod_rewrite`):
  `http://localhost/sejati-maps/backend-php/api/test-connection.php`
- Melalui router API (`mod_rewrite`):
  `http://localhost/sejati-maps/backend-php/api/test-connection`

Jika berhasil, respons JSON akan menampilkan `success: true`, versi MySQL, nama database aktif (`sejati_maps`), serta daftar tabel yang ditemukan tanpa menampilkan password database.

## 3. Menghubungkan Frontend ke API PHP Laragon
1. Isi `VITE_API_BASE_URL=http://localhost/sejati-maps/backend-php/api` pada file `.env`.
2. Jalankan `npm run build` untuk build web/Capacitor/Electron.
