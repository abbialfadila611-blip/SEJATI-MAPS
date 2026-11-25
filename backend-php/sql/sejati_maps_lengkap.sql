-- ============================================================================
-- SEJATI MAPS — Skrip MySQL Lengkap Siap Import / Tempel di phpMyAdmin
-- Kompatibel untuk MySQL 8.x & MariaDB (Laragon)
-- ============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+07:00";

-- 1. Buat & pilih database `sejati_maps`
CREATE DATABASE IF NOT EXISTS `sejati_maps`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `sejati_maps`;

-- ----------------------------------------------------------------------------
-- 2. Tabel `admin`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Tabel `kategori_menu` (8 Kategori)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kategori_menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `kategori_menu` (`id`, `nama_kategori`) VALUES
(1, 'Kopi Sejati'),
(2, 'Teh'),
(3, 'Susu'),
(4, 'Jeruk & Soda'),
(5, 'Camilan'),
(6, 'Roti Panggang & Kukus'),
(7, 'Makanan'),
(8, 'Indomie');

-- ----------------------------------------------------------------------------
-- 4. Tabel `menu` (60 Menu + Foto Sesuai Hidangan)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kategori_id` int DEFAULT NULL,
  `nama_menu` varchar(150) NOT NULL,
  `deskripsi` text,
  `harga` decimal(12,2) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `status` enum('tersedia','habis') DEFAULT 'tersedia',
  PRIMARY KEY (`id`),
  KEY `kategori_id` (`kategori_id`),
  CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_menu` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `menu` (`id`, `kategori_id`, `nama_menu`, `deskripsi`, `harga`, `foto`, `status`) VALUES
(1, 1, 'Kopi Hitam Panas', 'Kopi hitam panas', 10000.00, '/src/assets/images/menu_kopi_hitam_1795591762549.jpg', 'tersedia'),
(2, 1, 'Kopi Hitam Dingin', 'Kopi hitam dingin', 10000.00, '/src/assets/images/es_kopi_hitam_1795591957707.jpg', 'tersedia'),
(3, 1, 'Kopi Susu Panas', 'Kopi susu panas', 12000.00, '/src/assets/images/kopi_susu_panas_1795591957639.jpg', 'tersedia'),
(4, 1, 'Kopi Susu Dingin', 'Kopi susu dingin', 14000.00, '/src/assets/images/menu_kopi_susu_1795591763389.jpg', 'tersedia'),
(5, 1, 'Kopi Tarik Panas', 'Kopi tarik panas', 13000.00, '/src/assets/images/kopi_susu_panas_1795591957639.jpg', 'tersedia'),
(6, 1, 'Kopi Tarik Dingin', 'Kopi tarik dingin', 15000.00, '/src/assets/images/menu_kopi_susu_1795591763389.jpg', 'tersedia'),
(7, 1, 'Kopi Susu Aren Panas', 'Kopi susu aren panas', 13000.00, '/src/assets/images/kopi_susu_panas_1795591957639.jpg', 'tersedia'),
(8, 1, 'Kopi Susu Aren Dingin', 'Kopi susu aren dingin', 15000.00, '/src/assets/images/menu_kopi_susu_1795591763389.jpg', 'tersedia'),
(9, 1, 'Es Kopi Balok', 'Es kopi balok', 15000.00, '/src/assets/images/menu_kopi_susu_1795591763389.jpg', 'tersedia'),
(10, 2, 'Teh Tarik Sejati Panas', 'Teh tarik panas', 12000.00, '/src/assets/images/teh_tarik_tunggal_1795592095593.jpg', 'tersedia'),
(11, 2, 'Teh Tarik Sejati Dingin', 'Teh tarik dingin', 15000.00, '/src/assets/images/teh_tarik_tunggal_1795592095593.jpg', 'tersedia'),
(12, 2, 'Teh Lemon Panas', 'Teh lemon panas', 10000.00, '/src/assets/images/teh_lemon_1795591958432.jpg', 'tersedia'),
(13, 2, 'Teh Lemon Dingin', 'Teh lemon dingin', 12000.00, '/src/assets/images/teh_lemon_1795591958432.jpg', 'tersedia'),
(14, 2, 'Teh Leci Panas', 'Teh leci panas', 12000.00, '/src/assets/images/teh_leci_1795591958656.jpg', 'tersedia'),
(15, 2, 'Teh Leci Dingin', 'Teh leci dingin', 14000.00, '/src/assets/images/teh_leci_1795591958656.jpg', 'tersedia'),
(16, 2, 'Teh Manis Panas', 'Teh manis panas', 6000.00, '/src/assets/images/teh_manis_1795591958696.jpg', 'tersedia'),
(17, 2, 'Teh Manis Dingin', 'Teh manis dingin', 7000.00, '/src/assets/images/teh_manis_1795591958696.jpg', 'tersedia'),
(18, 2, 'Wedang Uwuh', 'Wedang uwuh panas', 10000.00, '/src/assets/images/wedang_uwuh_1795591959371.jpg', 'tersedia'),
(19, 3, 'Susu Panas', 'Susu panas', 8000.00, '/src/assets/images/susu_jahe_1795591960215.jpg', 'tersedia'),
(20, 3, 'Susu Dingin', 'Susu dingin', 10000.00, '/src/assets/images/susu_jahe_1795591960215.jpg', 'tersedia'),
(21, 3, 'Susu Jahe', 'Susu jahe panas', 8000.00, '/src/assets/images/susu_jahe_1795591960215.jpg', 'tersedia'),
(22, 3, 'Milo Dino Panas', 'Milo dino panas', 14000.00, '/src/assets/images/milo_dino_1795591960518.jpg', 'tersedia'),
(23, 3, 'Milo Dino Dingin', 'Milo dino dingin', 15000.00, '/src/assets/images/milo_dino_1795591960518.jpg', 'tersedia'),
(24, 3, 'Cincau Gula Aren', 'Minuman cincau gula aren', 15000.00, '/src/assets/images/cincau_aren_1795591960464.jpg', 'tersedia'),
(25, 4, 'Jeruk Manis Panas', 'Jeruk manis panas', 9000.00, '/src/assets/images/jeruk_manis_1795591961215.jpg', 'tersedia'),
(26, 4, 'Jeruk Manis Dingin', 'Jeruk manis dingin', 10000.00, '/src/assets/images/jeruk_manis_1795591961215.jpg', 'tersedia'),
(27, 4, 'Jeruk Sonmoy', 'Jeruk sonmoy', 12000.00, '/src/assets/images/jeruk_manis_1795591961215.jpg', 'tersedia'),
(28, 4, 'Jeruk Longan', 'Jeruk longan', 15000.00, '/src/assets/images/jeruk_manis_1795591961215.jpg', 'tersedia'),
(29, 4, 'Jeruk Kunci Panas', 'Jeruk kunci panas', 9000.00, '/src/assets/images/jeruk_kunci_1795591961574.jpg', 'tersedia'),
(30, 4, 'Jeruk Kunci Dingin', 'Jeruk kunci dingin', 10000.00, '/src/assets/images/jeruk_kunci_1795591961574.jpg', 'tersedia'),
(31, 4, 'Jeruk Kunci Sonmoy', 'Jeruk kunci sonmoy', 12000.00, '/src/assets/images/jeruk_kunci_1795591961574.jpg', 'tersedia'),
(32, 4, 'Calamansi Soda', 'Minuman calamansi soda', 15000.00, '/src/assets/images/jeruk_kunci_1795591961574.jpg', 'tersedia'),
(33, 4, 'Soda Susu', 'Minuman soda susu', 12000.00, '/src/assets/images/soda_susu_1795592092299.jpg', 'tersedia'),
(34, 4, 'Extra Joss Susu', 'Minuman extra joss susu', 10000.00, '/src/assets/images/soda_susu_1795592092299.jpg', 'tersedia'),
(35, 4, 'Es Badak', 'Minuman es badak', 20000.00, '/src/assets/images/es_badak_1795591962297.jpg', 'tersedia'),
(36, 4, 'Badak Float', 'Minuman badak float', 25000.00, '/src/assets/images/es_badak_1795591962297.jpg', 'tersedia'),
(37, 4, 'Mineral', 'Air mineral', 5000.00, '/src/assets/images/air_mineral_1795591962987.jpg', 'tersedia'),
(38, 5, 'Telur 1/2 Matang', 'Telur setengah matang', 12000.00, '/src/assets/images/telur_setengah_matang_1795592092166.jpg', 'tersedia'),
(39, 5, 'Singkong Goreng', 'Singkong goreng', 10000.00, '/src/assets/images/singkong_goreng_1795592092993.jpg', 'tersedia'),
(40, 5, 'Cireng Ayam', 'Cireng isi ayam', 15000.00, '/src/assets/images/cireng_ayam_1795592092856.jpg', 'tersedia'),
(41, 5, 'Kentang Goreng', 'Kentang goreng', 15000.00, '/src/assets/images/kentang_goreng_1795592093259.jpg', 'tersedia'),
(42, 5, 'Pisang Goreng Cokelat/Keju', 'Pisang goreng cokelat atau keju', 12000.00, '/src/assets/images/pisang_goreng_1795591964879.jpg', 'tersedia'),
(43, 5, 'Pisang Goreng Cokelat Keju', 'Pisang goreng cokelat keju', 15000.00, '/src/assets/images/pisang_goreng_1795591964879.jpg', 'tersedia'),
(44, 6, 'Roti Panggang Cokelat', 'Roti panggang cokelat', 12000.00, '/src/assets/images/roti_panggang_1795592095231.jpg', 'tersedia'),
(45, 6, 'Roti Panggang Keju', 'Roti panggang keju', 15000.00, '/src/assets/images/roti_panggang_1795592095231.jpg', 'tersedia'),
(46, 6, 'Roti Panggang Cokelat Keju', 'Roti panggang cokelat keju', 18000.00, '/src/assets/images/roti_panggang_1795592095231.jpg', 'tersedia'),
(47, 6, 'Roti Panggang Mentega Gula', 'Roti panggang mentega gula', 10000.00, '/src/assets/images/roti_panggang_1795592095231.jpg', 'tersedia'),
(48, 6, 'Roti Kukus Cokelat', 'Roti kukus cokelat', 10000.00, '/src/assets/images/roti_kukus_1795592045815.jpg', 'tersedia'),
(49, 6, 'Roti Kukus Keju', 'Roti kukus keju', 10000.00, '/src/assets/images/roti_kukus_1795592045815.jpg', 'tersedia'),
(50, 6, 'Roti Kukus Mentega Gula', 'Roti kukus mentega gula', 10000.00, '/src/assets/images/roti_kukus_1795592045815.jpg', 'tersedia'),
(51, 7, 'Nasi Goreng Kampung', 'Nasi goreng kampung', 17000.00, '/src/assets/images/nasi_goreng_1795592094330.jpg', 'tersedia'),
(52, 7, 'Kwetiau Goreng', 'Kwetiau goreng', 17000.00, '/src/assets/images/kwetiau_goreng_1795592046625.jpg', 'tersedia'),
(53, 7, 'Mie Nyemek', 'Mie nyemek', 17000.00, '/src/assets/images/menu_indomie_warkop_1795591768072.jpg', 'tersedia'),
(54, 8, 'Mie Goreng Single', 'Indomie goreng single', 8000.00, '/src/assets/images/menu_indomie_warkop_1795591768072.jpg', 'tersedia'),
(55, 8, 'Mie Goreng Double', 'Indomie goreng double', 12000.00, '/src/assets/images/menu_indomie_warkop_1795591768072.jpg', 'tersedia'),
(56, 8, 'Mie Jumbo', 'Indomie jumbo', 10000.00, '/src/assets/images/menu_indomie_warkop_1795591768072.jpg', 'tersedia'),
(57, 8, 'Mie Soto Single', 'Indomie soto single', 8000.00, '/src/assets/images/indomie_kuah_1795592094832.jpg', 'tersedia'),
(58, 8, 'Mie Soto Double', 'Indomie soto double', 12000.00, '/src/assets/images/indomie_kuah_1795592094832.jpg', 'tersedia'),
(59, 8, 'Mie Kari Single', 'Indomie kari single', 8000.00, '/src/assets/images/indomie_kuah_1795592094832.jpg', 'tersedia'),
(60, 8, 'Mie Kari Double', 'Indomie kari double', 12000.00, '/src/assets/images/indomie_kuah_1795592094832.jpg', 'tersedia');

-- ----------------------------------------------------------------------------
-- 5. Tabel `pelanggan` (Lengkap dengan kolom username & password untuk Daftar/Login)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pelanggan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `telepon` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `alamat` text,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pelanggan_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Tabel `warkop` (Lokasi Usaha Kuliner Pangkal Pinang)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `warkop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(150) NOT NULL,
  `alamat` text,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `deskripsi` text,
  `telepon` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `warkop` (`id`, `nama`, `alamat`, `latitude`, `longitude`, `deskripsi`, `telepon`) VALUES
(1, 'WARKOP SEJATI', 'Jalan Pasar Mambo, Kelurahan Masjid Jamik, Kecamatan Rangkui, Pangkalpinang', -2.1301668, 106.1125737, 'Warkop Sejati menyediakan makanan dan minuman serta layanan pemesanan online dan reservasi', NULL);

-- ----------------------------------------------------------------------------
-- 7. Tabel `pesanan`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pesanan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pelanggan_id` int NOT NULL,
  `kode_pesanan` varchar(30) NOT NULL,
  `jenis_pesanan` enum('dine_in','takeaway') NOT NULL,
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('menunggu','diproses','selesai','dibatalkan') DEFAULT 'menunggu',
  `tanggal_pesanan` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_pesanan` (`kode_pesanan`),
  KEY `pelanggan_id` (`pelanggan_id`),
  CONSTRAINT `pesanan_ibfk_1` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Tabel `detail_pesanan`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `detail_pesanan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pesanan_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `jumlah` int NOT NULL,
  `harga` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pesanan_id` (`pesanan_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `detail_pesanan_ibfk_1` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`),
  CONSTRAINT `detail_pesanan_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Tabel `pembayaran`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pembayaran` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pesanan_id` int NOT NULL,
  `metode` varchar(50) DEFAULT NULL,
  `jumlah_bayar` decimal(12,2) NOT NULL,
  `status` enum('belum_bayar','menunggu_verifikasi','lunas','gagal') DEFAULT 'belum_bayar',
  `tanggal_bayar` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pesanan_id` (`pesanan_id`),
  CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Tabel `reservasi`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reservasi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pelanggan_id` int NOT NULL,
  `tanggal` date NOT NULL,
  `jam` time NOT NULL,
  `jumlah_orang` int NOT NULL,
  `catatan` text,
  `status` enum('menunggu','dikonfirmasi','ditolak','selesai','dibatalkan') DEFAULT 'menunggu',
  PRIMARY KEY (`id`),
  KEY `pelanggan_id` (`pelanggan_id`),
  CONSTRAINT `reservasi_ibfk_1` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
