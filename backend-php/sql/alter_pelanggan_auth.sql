-- Menambahkan kolom autentikasi (username & password) pada tabel `pelanggan` yang sudah ada
-- Jalankan query ini di phpMyAdmin pada database `sejati_maps`

ALTER TABLE `pelanggan`
  ADD COLUMN `username` varchar(50) DEFAULT NULL AFTER `alamat`,
  ADD COLUMN `password` varchar(255) DEFAULT NULL AFTER `username`,
  ADD UNIQUE KEY `uq_pelanggan_username` (`username`);
