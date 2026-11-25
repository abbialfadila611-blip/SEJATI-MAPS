-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 25, 2026 at 06:57 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sejati maps`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `detail_pesanan`
--

CREATE TABLE `detail_pesanan` (
  `id` int NOT NULL,
  `pesanan_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `jumlah` int NOT NULL,
  `harga` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori_menu`
--

CREATE TABLE `kategori_menu` (
  `id` int NOT NULL,
  `nama_kategori` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kategori_menu`
--

INSERT INTO `kategori_menu` (`id`, `nama_kategori`) VALUES
(1, 'Kopi Sejati'),
(2, 'Teh'),
(3, 'Susu'),
(4, 'Jeruk & Soda'),
(5, 'Camilan'),
(6, 'Roti Panggang & Kukus'),
(7, 'Makanan'),
(8, 'Indomie');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id` int NOT NULL,
  `kategori_id` int DEFAULT NULL,
  `nama_menu` varchar(150) NOT NULL,
  `deskripsi` text,
  `harga` decimal(12,2) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `status` enum('tersedia','habis') DEFAULT 'tersedia'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id`, `kategori_id`, `nama_menu`, `deskripsi`, `harga`, `foto`, `status`) VALUES
(1, 1, 'Kopi Hitam Panas', 'Kopi hitam panas', 10000.00, NULL, 'tersedia'),
(2, 1, 'Kopi Hitam Dingin', 'Kopi hitam dingin', 10000.00, NULL, 'tersedia'),
(3, 1, 'Kopi Susu Panas', 'Kopi susu panas', 12000.00, NULL, 'tersedia'),
(4, 1, 'Kopi Susu Dingin', 'Kopi susu dingin', 14000.00, NULL, 'tersedia'),
(5, 1, 'Kopi Tarik Panas', 'Kopi tarik panas', 13000.00, NULL, 'tersedia'),
(6, 1, 'Kopi Tarik Dingin', 'Kopi tarik dingin', 15000.00, NULL, 'tersedia'),
(7, 1, 'Kopi Susu Aren Panas', 'Kopi susu aren panas', 13000.00, NULL, 'tersedia'),
(8, 1, 'Kopi Susu Aren Dingin', 'Kopi susu aren dingin', 15000.00, NULL, 'tersedia'),
(9, 1, 'Es Kopi Balok', 'Es kopi balok', 15000.00, NULL, 'tersedia'),
(10, 2, 'Teh Tarik Sejati Panas', 'Teh tarik panas', 12000.00, NULL, 'tersedia'),
(11, 2, 'Teh Tarik Sejati Dingin', 'Teh tarik dingin', 15000.00, NULL, 'tersedia'),
(12, 2, 'Teh Lemon Panas', 'Teh lemon panas', 10000.00, NULL, 'tersedia'),
(13, 2, 'Teh Lemon Dingin', 'Teh lemon dingin', 12000.00, NULL, 'tersedia'),
(14, 2, 'Teh Leci Panas', 'Teh leci panas', 12000.00, NULL, 'tersedia'),
(15, 2, 'Teh Leci Dingin', 'Teh leci dingin', 14000.00, NULL, 'tersedia'),
(16, 2, 'Teh Manis Panas', 'Teh manis panas', 6000.00, NULL, 'tersedia'),
(17, 2, 'Teh Manis Dingin', 'Teh manis dingin', 7000.00, NULL, 'tersedia'),
(18, 2, 'Wedang Uwuh', 'Wedang uwuh panas', 10000.00, NULL, 'tersedia'),
(19, 3, 'Susu Panas', 'Susu panas', 8000.00, NULL, 'tersedia'),
(20, 3, 'Susu Dingin', 'Susu dingin', 10000.00, NULL, 'tersedia'),
(21, 3, 'Susu Jahe', 'Susu jahe panas', 8000.00, NULL, 'tersedia'),
(22, 3, 'Milo Dino Panas', 'Milo dino panas', 14000.00, NULL, 'tersedia'),
(23, 3, 'Milo Dino Dingin', 'Milo dino dingin', 15000.00, NULL, 'tersedia'),
(24, 3, 'Cincau Gula Aren', 'Minuman cincau gula aren', 15000.00, NULL, 'tersedia'),
(25, 4, 'Jeruk Manis Panas', 'Jeruk manis panas', 9000.00, NULL, 'tersedia'),
(26, 4, 'Jeruk Manis Dingin', 'Jeruk manis dingin', 10000.00, NULL, 'tersedia'),
(27, 4, 'Jeruk Sonmoy', 'Jeruk sonmoy', 12000.00, NULL, 'tersedia'),
(28, 4, 'Jeruk Longan', 'Jeruk longan', 15000.00, NULL, 'tersedia'),
(29, 4, 'Jeruk Kunci Panas', 'Jeruk kunci panas', 9000.00, NULL, 'tersedia'),
(30, 4, 'Jeruk Kunci Dingin', 'Jeruk kunci dingin', 10000.00, NULL, 'tersedia'),
(31, 4, 'Jeruk Kunci Sonmoy', 'Jeruk kunci sonmoy', 12000.00, NULL, 'tersedia'),
(32, 4, 'Calamansi Soda', 'Minuman calamansi soda', 15000.00, NULL, 'tersedia'),
(33, 4, 'Soda Susu', 'Minuman soda susu', 12000.00, NULL, 'tersedia'),
(34, 4, 'Extra Joss Susu', 'Minuman extra joss susu', 10000.00, NULL, 'tersedia'),
(35, 4, 'Es Badak', 'Minuman es badak', 20000.00, NULL, 'tersedia'),
(36, 4, 'Badak Float', 'Minuman badak float', 25000.00, NULL, 'tersedia'),
(37, 4, 'Mineral', 'Air mineral', 5000.00, NULL, 'tersedia'),
(38, 5, 'Telur 1/2 Matang', 'Telur setengah matang', 12000.00, NULL, 'tersedia'),
(39, 5, 'Singkong Goreng', 'Singkong goreng', 10000.00, NULL, 'tersedia'),
(40, 5, 'Cireng Ayam', 'Cireng isi ayam', 15000.00, NULL, 'tersedia'),
(41, 5, 'Kentang Goreng', 'Kentang goreng', 15000.00, NULL, 'tersedia'),
(42, 5, 'Pisang Goreng Cokelat/Keju', 'Pisang goreng cokelat atau keju', 12000.00, NULL, 'tersedia'),
(43, 5, 'Pisang Goreng Cokelat Keju', 'Pisang goreng cokelat keju', 15000.00, NULL, 'tersedia'),
(44, 6, 'Roti Panggang Cokelat', 'Roti panggang cokelat', 12000.00, NULL, 'tersedia'),
(45, 6, 'Roti Panggang Keju', 'Roti panggang keju', 15000.00, NULL, 'tersedia'),
(46, 6, 'Roti Panggang Cokelat Keju', 'Roti panggang cokelat keju', 18000.00, NULL, 'tersedia'),
(47, 6, 'Roti Panggang Mentega Gula', 'Roti panggang mentega gula', 10000.00, NULL, 'tersedia'),
(48, 6, 'Roti Kukus Cokelat', 'Roti kukus cokelat', 10000.00, NULL, 'tersedia'),
(49, 6, 'Roti Kukus Keju', 'Roti kukus keju', 10000.00, NULL, 'tersedia'),
(50, 6, 'Roti Kukus Mentega Gula', 'Roti kukus mentega gula', 10000.00, NULL, 'tersedia'),
(51, 7, 'Nasi Goreng Kampung', 'Nasi goreng kampung', 17000.00, NULL, 'tersedia'),
(52, 7, 'Kwetiau Goreng', 'Kwetiau goreng', 17000.00, NULL, 'tersedia'),
(53, 7, 'Mie Nyemek', 'Mie nyemek', 17000.00, NULL, 'tersedia'),
(54, 8, 'Mie Goreng Single', 'Indomie goreng single', 8000.00, NULL, 'tersedia'),
(55, 8, 'Mie Goreng Double', 'Indomie goreng double', 12000.00, NULL, 'tersedia'),
(56, 8, 'Mie Jumbo', 'Indomie jumbo', 10000.00, NULL, 'tersedia'),
(57, 8, 'Mie Soto Single', 'Indomie soto single', 8000.00, NULL, 'tersedia'),
(58, 8, 'Mie Soto Double', 'Indomie soto double', 12000.00, NULL, 'tersedia'),
(59, 8, 'Mie Kari Single', 'Indomie kari single', 8000.00, NULL, 'tersedia'),
(60, 8, 'Mie Kari Double', 'Indomie kari double', 12000.00, NULL, 'tersedia');

-- --------------------------------------------------------

--
-- Table structure for table `pelanggan`
--

CREATE TABLE `pelanggan` (
  `id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `telepon` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `alamat` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id` int NOT NULL,
  `pesanan_id` int NOT NULL,
  `metode` varchar(50) DEFAULT NULL,
  `jumlah_bayar` decimal(12,2) NOT NULL,
  `status` enum('belum_bayar','menunggu_verifikasi','lunas','gagal') DEFAULT 'belum_bayar',
  `tanggal_bayar` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pesanan`
--

CREATE TABLE `pesanan` (
  `id` int NOT NULL,
  `pelanggan_id` int NOT NULL,
  `kode_pesanan` varchar(30) NOT NULL,
  `jenis_pesanan` enum('dine_in','takeaway') NOT NULL,
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('menunggu','diproses','selesai','dibatalkan') DEFAULT 'menunggu',
  `tanggal_pesanan` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reservasi`
--

CREATE TABLE `reservasi` (
  `id` int NOT NULL,
  `pelanggan_id` int NOT NULL,
  `tanggal` date NOT NULL,
  `jam` time NOT NULL,
  `jumlah_orang` int NOT NULL,
  `catatan` text,
  `status` enum('menunggu','dikonfirmasi','ditolak','selesai','dibatalkan') DEFAULT 'menunggu'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warkop`
--

CREATE TABLE `warkop` (
  `id` int NOT NULL,
  `nama` varchar(150) NOT NULL,
  `alamat` text,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `deskripsi` text,
  `telepon` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `warkop`
--

INSERT INTO `warkop` (`id`, `nama`, `alamat`, `latitude`, `longitude`, `deskripsi`, `telepon`) VALUES
(1, 'WARKOP SEJATI', 'Jalan Pasar Mambo, Kelurahan Masjid Jamik, Kecamatan Rangkui, Pangkalpinang', -2.1301668, 106.1125737, 'Warkop Sejati menyediakan makanan dan minuman serta layanan pemesanan online dan reservasi', NULL),
(2, 'WARKOP SEJATI', 'Jalan Pasar Mambo, Kelurahan Masjid Jamik, Kecamatan Rangkui, Pangkalpinang\r\n', -2.1301668, 106.1125737, 'Warkop Sejati menyediakan makanan dan minuman serta layanan pemesanan online dan reservasi', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pesanan_id` (`pesanan_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `kategori_menu`
--
ALTER TABLE `kategori_menu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kategori_id` (`kategori_id`);

--
-- Indexes for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pesanan_id` (`pesanan_id`);

--
-- Indexes for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_pesanan` (`kode_pesanan`),
  ADD KEY `pelanggan_id` (`pelanggan_id`);

--
-- Indexes for table `reservasi`
--
ALTER TABLE `reservasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pelanggan_id` (`pelanggan_id`);

--
-- Indexes for table `warkop`
--
ALTER TABLE `warkop`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kategori_menu`
--
ALTER TABLE `kategori_menu`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `pelanggan`
--
ALTER TABLE `pelanggan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pesanan`
--
ALTER TABLE `pesanan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reservasi`
--
ALTER TABLE `reservasi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warkop`
--
ALTER TABLE `warkop`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD CONSTRAINT `detail_pesanan_ibfk_1` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`),
  ADD CONSTRAINT `detail_pesanan_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`);

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_menu` (`id`);

--
-- Constraints for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`);

--
-- Constraints for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD CONSTRAINT `pesanan_ibfk_1` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`);

--
-- Constraints for table `reservasi`
--
ALTER TABLE `reservasi`
  ADD CONSTRAINT `reservasi_ibfk_1` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
