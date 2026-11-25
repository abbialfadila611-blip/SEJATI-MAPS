<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/GeoValidator.php';
require_once __DIR__ . '/../src/Auth.php';

// Konfigurasi CORS aman untuk development Laragon, Capacitor, dan Electron
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://localhost',
    'capacitor://localhost',
    'https://localhost',
    getenv('FRONTEND_ORIGIN') ?: null,
]);

if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function sendJson(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        sendJson(400, ['success' => false, 'message' => 'Format JSON tidak valid.']);
    }
    return $decoded;
}

function normalizePhone(string $phone): string
{
    return preg_replace('/[^0-9+]/', '', trim($phone)) ?? '';
}

$method = $_SERVER['REQUEST_METHOD'];
$route = $_GET['route'] ?? '';
if ($route === '') {
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $pos = strpos($uriPath, '/api');
    $route = $pos !== false ? substr($uriPath, $pos + 4) : $uriPath;
}
$route = '/' . trim($route, '/');

try {
    $pdo = getDbConnection();

    // =========================================================================
    // 0. UJI KONEKSI DATABASE PDO
    // =========================================================================
    if ($method === 'GET' && $route === '/test-connection') {
        $dbInfo = getPublicDbInfo();
        $meta = $pdo->query('SELECT DATABASE() AS active_database, VERSION() AS mysql_version')->fetch() ?: [];
        $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);

        sendJson(200, [
            'success'       => true,
            'message'       => 'Koneksi PDO ke database MySQL berhasil.',
            'host'          => $dbInfo['host'],
            'port'          => $dbInfo['port'],
            'database'      => $meta['active_database'] ?? $dbInfo['dbname'],
            'mysql_version' => $meta['mysql_version'] ?? null,
            'total_tables'  => count($tables),
            'tables'        => $tables,
        ]);
    }

    // =========================================================================
    // 1. KATALOG PUBLIK (kategori_menu, menu, warkop)
    // =========================================================================
    if ($method === 'GET' && $route === '/catalog') {
        $kategori = $pdo->query('SELECT id, nama_kategori FROM kategori_menu ORDER BY id ASC')->fetchAll();

        $menuStmt = $pdo->query(
            'SELECT m.id, m.kategori_id, k.nama_kategori, m.nama_menu, m.deskripsi, m.harga, m.foto, m.status
             FROM menu m
             LEFT JOIN kategori_menu k ON k.id = m.kategori_id
             ORDER BY m.kategori_id ASC, m.id ASC'
        );
        $menu = array_map(static function (array $row): array {
            $row['id'] = (int) $row['id'];
            $row['kategori_id'] = $row['kategori_id'] !== null ? (int) $row['kategori_id'] : null;
            $row['harga'] = (float) $row['harga'];
            return $row;
        }, $menuStmt->fetchAll());

        $warkopStmt = $pdo->query('SELECT id, nama, alamat, latitude, longitude, deskripsi, telepon FROM warkop ORDER BY id ASC');
        $warkop = array_map(static function (array $row): array {
            $row['id'] = (int) $row['id'];
            $row['latitude'] = $row['latitude'] !== null ? (float) $row['latitude'] : null;
            $row['longitude'] = $row['longitude'] !== null ? (float) $row['longitude'] : null;
            return $row;
        }, $warkopStmt->fetchAll());

        $kategori = array_map(static function (array $row): array {
            $row['id'] = (int) $row['id'];
            return $row;
        }, $kategori);

        sendJson(200, [
            'success' => true,
            'kategori' => $kategori,
            'menu' => $menu,
            'warkop' => $warkop,
        ]);
    }

    // =========================================================================
    // 2. VALIDASI GEOSPASIAL WILAYAH PANGKAL PINANG
    // =========================================================================
    if ($method === 'GET' && $route === '/geo/validate') {
        $lat = isset($_GET['lat']) ? (float) $_GET['lat'] : NAN;
        $lng = isset($_GET['lng']) ? (float) $_GET['lng'] : NAN;

        if (!is_finite($lat) || !is_finite($lng)) {
            sendJson(400, ['success' => false, 'message' => 'Parameter lat dan lng wajib valid.']);
        }

        $inside = GeoValidator::isInsidePangkalPinang($lat, $lng);
        $district = GeoValidator::estimateDistrict($lat, $lng);

        $warkopRows = $pdo->query('SELECT id, nama, latitude, longitude FROM warkop WHERE latitude IS NOT NULL AND longitude IS NOT NULL')->fetchAll();
        $nearest = null;
        $bestDist = INF;
        foreach ($warkopRows as $w) {
            $dist = GeoValidator::haversineDistanceKm($lat, $lng, (float) $w['latitude'], (float) $w['longitude']);
            if ($dist < $bestDist) {
                $bestDist = $dist;
                $nearest = [
                    'id' => (int) $w['id'],
                    'nama' => $w['nama'],
                    'distance_km' => $dist,
                ];
            }
        }

        sendJson(200, [
            'success' => true,
            'valid' => $inside,
            'latitude' => $lat,
            'longitude' => $lng,
            'region' => 'Kota Pangkal Pinang',
            'kecamatan_estimasi' => $district,
            'message' => $inside
                ? 'Lokasi Anda berada dalam wilayah layanan Kota Pangkal Pinang (' . ($district ?? 'Pangkal Pinang') . ').'
                : 'Lokasi Anda berada di luar batas wilayah layanan administratif Kota Pangkal Pinang.',
            'nearest_warkop' => $nearest,
        ]);
    }

    // =========================================================================
    // 3. AUTENTIKASI PELANGGAN (tabel `pelanggan`)
    // =========================================================================
    if ($method === 'POST' && $route === '/auth/customer/register') {
        $body = getJsonBody();
        $nama = trim((string) ($body['nama'] ?? ''));
        $telepon = normalizePhone((string) ($body['telepon'] ?? ''));
        $email = trim((string) ($body['email'] ?? ''));
        $alamat = trim((string) ($body['alamat'] ?? ''));
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($nama === '' || strlen($telepon) < 8) {
            sendJson(422, ['success' => false, 'message' => 'Nama lengkap dan nomor telepon (min. 8 digit) wajib diisi.']);
        }

        $colStmt = $pdo->query("SHOW COLUMNS FROM pelanggan LIKE 'password'");
        $hasAuthCols = (bool) $colStmt->fetch();

        if ($hasAuthCols) {
            if (strlen($username) < 3 || !preg_match('/^[a-zA-Z0-9._-]+$/', $username)) {
                sendJson(422, ['success' => false, 'message' => 'Username minimal 3 karakter (huruf, angka, titik, atau garis bawah).']);
            }
            if (strlen($password) < 6) {
                sendJson(422, ['success' => false, 'message' => 'Password minimal 6 karakter.']);
            }
        }

        $check = $pdo->prepare('SELECT id FROM pelanggan WHERE telepon = ? LIMIT 1');
        $check->execute([$telepon]);
        if ($check->fetch()) {
            sendJson(409, ['success' => false, 'message' => 'Nomor telepon sudah terdaftar. Silakan gunakan kolom Login.']);
        }

        if ($hasAuthCols) {
            $checkUser = $pdo->prepare('SELECT id FROM pelanggan WHERE username = ? LIMIT 1');
            $checkUser->execute([$username]);
            if ($checkUser->fetch()) {
                sendJson(409, ['success' => false, 'message' => 'Username sudah digunakan pelanggan lain.']);
            }

            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare('INSERT INTO pelanggan (nama, telepon, email, alamat, username, password) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $nama,
                $telepon,
                $email !== '' ? $email : null,
                $alamat !== '' ? $alamat : null,
                $username,
                $passwordHash,
            ]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO pelanggan (nama, telepon, email, alamat) VALUES (?, ?, ?, ?)');
            $stmt->execute([
                $nama,
                $telepon,
                $email !== '' ? $email : null,
                $alamat !== '' ? $alamat : null,
            ]);
        }

        $id = (int) $pdo->lastInsertId();
        $customer = [
            'id' => $id,
            'nama' => $nama,
            'telepon' => $telepon,
            'email' => $email !== '' ? $email : null,
            'alamat' => $alamat !== '' ? $alamat : null,
            'username' => $hasAuthCols ? $username : null,
        ];
        $token = Auth::issueToken(['role' => 'pelanggan', 'sub' => $id, 'telepon' => $telepon]);

        sendJson(201, ['success' => true, 'pelanggan' => $customer, 'token' => $token]);
    }

    if ($method === 'POST' && $route === '/auth/customer/login') {
        $body = getJsonBody();
        $identifier = trim((string) ($body['identifier'] ?? $body['username'] ?? $body['telepon'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        $nama = trim((string) ($body['nama'] ?? ''));

        $colStmt = $pdo->query("SHOW COLUMNS FROM pelanggan LIKE 'password'");
        $hasAuthCols = (bool) $colStmt->fetch();

        if ($hasAuthCols) {
            if ($identifier === '' || $password === '') {
                sendJson(422, ['success' => false, 'message' => 'Username atau nomor telepon dan password wajib diisi.']);
            }

            $normalizedPhone = normalizePhone($identifier);
            $stmt = $pdo->prepare(
                'SELECT id, nama, telepon, email, alamat, username, password
                 FROM pelanggan
                 WHERE username = ? OR telepon = ? OR email = ?
                 LIMIT 1'
            );
            $stmt->execute([$identifier, $normalizedPhone, $identifier]);
            $row = $stmt->fetch();

            if (!$row || empty($row['password']) || !password_verify($password, (string) $row['password'])) {
                sendJson(401, ['success' => false, 'message' => 'Username/telepon atau password salah.']);
            }
            unset($row['password']);
        } else {
            $telepon = normalizePhone($identifier);
            if ($telepon === '' || $nama === '') {
                sendJson(422, ['success' => false, 'message' => 'Nomor telepon dan nama terdaftar wajib diisi.']);
            }
            $stmt = $pdo->prepare('SELECT id, nama, telepon, email, alamat FROM pelanggan WHERE telepon = ? LIMIT 1');
            $stmt->execute([$telepon]);
            $row = $stmt->fetch();

            if (!$row || strcasecmp(trim((string) $row['nama']), $nama) !== 0) {
                sendJson(401, ['success' => false, 'message' => 'Kombinasi nomor telepon dan nama pelanggan tidak cocok.']);
            }
        }

        $row['id'] = (int) $row['id'];
        $token = Auth::issueToken(['role' => 'pelanggan', 'sub' => $row['id'], 'telepon' => $row['telepon']]);
        sendJson(200, ['success' => true, 'pelanggan' => $row, 'token' => $token]);
    }

    // =========================================================================
    // 4. AUTENTIKASI ADMIN (tabel `admin`)
    // =========================================================================
    if ($method === 'GET' && $route === '/auth/admin/status') {
        $count = (int) $pdo->query('SELECT COUNT(*) FROM admin')->fetchColumn();
        sendJson(200, ['success' => true, 'has_admin' => $count > 0]);
    }

    if ($method === 'POST' && $route === '/auth/admin/setup') {
        $count = (int) $pdo->query('SELECT COUNT(*) FROM admin')->fetchColumn();
        if ($count > 0) {
            sendJson(403, ['success' => false, 'message' => 'Akun admin sudah terdaftar. Silakan login.']);
        }

        $body = getJsonBody();
        $nama = trim((string) ($body['nama'] ?? ''));
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($nama === '' || strlen($username) < 3 || strlen($password) < 6) {
            sendJson(422, ['success' => false, 'message' => 'Nama, username (min. 3 karakter), dan password (min. 6 karakter) wajib diisi.']);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO admin (nama, username, password) VALUES (?, ?, ?)');
        $stmt->execute([$nama, $username, $hash]);
        $id = (int) $pdo->lastInsertId();

        $admin = ['id' => $id, 'nama' => $nama, 'username' => $username];
        $token = Auth::issueToken(['role' => 'admin', 'sub' => $id, 'username' => $username]);
        sendJson(201, ['success' => true, 'admin' => $admin, 'token' => $token]);
    }

    if ($method === 'POST' && $route === '/auth/admin/login') {
        $body = getJsonBody();
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        $stmt = $pdo->prepare('SELECT id, nama, username, password FROM admin WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $row = $stmt->fetch();

        $validPassword = false;
        if ($row) {
            $stored = (string) $row['password'];
            $validPassword = password_verify($password, $stored) || hash_equals($stored, $password);
        }

        if (!$row || !$validPassword) {
            sendJson(401, ['success' => false, 'message' => 'Username atau password admin salah.']);
        }

        $admin = ['id' => (int) $row['id'], 'nama' => $row['nama'], 'username' => $row['username']];
        $token = Auth::issueToken(['role' => 'admin', 'sub' => $admin['id'], 'username' => $admin['username']]);
        sendJson(200, ['success' => true, 'admin' => $admin, 'token' => $token]);
    }

    // =========================================================================
    // 5. CHECKOUT & RIWAYAT PELANGGAN (VALIDASI GEOSPASIAL WAJIB DI BACKEND)
    // =========================================================================
    if ($method === 'POST' && $route === '/orders/checkout') {
        $claims = Auth::requireRole('pelanggan');
        $pelangganId = (int) $claims['sub'];
        $body = getJsonBody();

        $lat = isset($body['latitude']) ? (float) $body['latitude'] : NAN;
        $lng = isset($body['longitude']) ? (float) $body['longitude'] : NAN;

        // Validasi geospasial wajib di backend!
        if (!is_finite($lat) || !is_finite($lng)) {
            sendJson(422, [
                'success' => false,
                'message' => 'Koordinat GPS pelanggan wajib dikirim untuk verifikasi wilayah Kota Pangkal Pinang.',
            ]);
        }

        if (!GeoValidator::isInsidePangkalPinang($lat, $lng)) {
            sendJson(403, [
                'success' => false,
                'code' => 'OUT_OF_SERVICE_AREA',
                'message' => 'Checkout ditolak: Lokasi GPS Anda berada di luar wilayah administratif Kota Pangkal Pinang.',
            ]);
        }

        $jenisPesanan = ($body['jenis_pesanan'] ?? '') === 'dine_in' ? 'dine_in' : 'takeaway';
        $metodePembayaran = trim((string) ($body['metode_pembayaran'] ?? 'Tunai'));
        if ($metodePembayaran === '') {
            $metodePembayaran = 'Tunai';
        }

        $itemsInput = $body['items'] ?? [];
        if (!is_array($itemsInput) || count($itemsInput) === 0) {
            sendJson(422, ['success' => false, 'message' => 'Keranjang pesanan kosong.']);
        }

        $pdo->beginTransaction();
        try {
            $menuStmt = $pdo->prepare('SELECT id, nama_menu, harga, status FROM menu WHERE id = ? LIMIT 1');
            $resolvedItems = [];
            $total = 0.0;

            foreach ($itemsInput as $item) {
                $menuId = (int) ($item['menu_id'] ?? 0);
                $jumlah = (int) ($item['jumlah'] ?? 0);
                if ($menuId <= 0 || $jumlah <= 0) {
                    throw new RuntimeException('Data item pesanan tidak valid.');
                }

                $menuStmt->execute([$menuId]);
                $menuRow = $menuStmt->fetch();
                if (!$menuRow) {
                    throw new RuntimeException("Menu dengan ID {$menuId} tidak ditemukan.");
                }
                if ($menuRow['status'] !== 'tersedia') {
                    throw new RuntimeException("Menu {$menuRow['nama_menu']} sedang habis.");
                }

                $harga = (float) $menuRow['harga'];
                $subtotal = $harga * $jumlah;
                $total += $subtotal;

                $resolvedItems[] = [
                    'menu_id' => $menuId,
                    'nama_menu' => $menuRow['nama_menu'],
                    'jumlah' => $jumlah,
                    'harga' => $harga,
                    'subtotal' => $subtotal,
                ];
            }

            $kodePesanan = 'SJT-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
            $orderStmt = $pdo->prepare(
                'INSERT INTO pesanan (pelanggan_id, kode_pesanan, jenis_pesanan, total, status) VALUES (?, ?, ?, ?, ?)'
            );
            $orderStmt->execute([$pelangganId, $kodePesanan, $jenisPesanan, $total, 'menunggu']);
            $pesananId = (int) $pdo->lastInsertId();

            $detailStmt = $pdo->prepare(
                'INSERT INTO detail_pesanan (pesanan_id, menu_id, jumlah, harga, subtotal) VALUES (?, ?, ?, ?, ?)'
            );
            foreach ($resolvedItems as $line) {
                $detailStmt->execute([$pesananId, $line['menu_id'], $line['jumlah'], $line['harga'], $line['subtotal']]);
            }

            $payStatus = strcasecmp($metodePembayaran, 'Tunai') === 0 ? 'belum_bayar' : 'menunggu_verifikasi';
            $payStmt = $pdo->prepare(
                'INSERT INTO pembayaran (pesanan_id, metode, jumlah_bayar, status) VALUES (?, ?, ?, ?)'
            );
            $payStmt->execute([$pesananId, $metodePembayaran, $total, $payStatus]);

            $pdo->commit();

            sendJson(201, [
                'success' => true,
                'message' => 'Pesanan berhasil dibuat di wilayah layanan Kota Pangkal Pinang.',
                'pesanan' => [
                    'id' => $pesananId,
                    'pelanggan_id' => $pelangganId,
                    'kode_pesanan' => $kodePesanan,
                    'jenis_pesanan' => $jenisPesanan,
                    'total' => $total,
                    'status' => 'menunggu',
                    'tanggal_pesanan' => date('Y-m-d H:i:s'),
                    'items' => $resolvedItems,
                    'pembayaran' => [
                        'pesanan_id' => $pesananId,
                        'metode' => $metodePembayaran,
                        'jumlah_bayar' => $total,
                        'status' => $payStatus,
                        'tanggal_bayar' => null,
                    ],
                ],
            ]);
        } catch (Throwable $e) {
            $pdo->rollBack();
            sendJson(400, ['success' => false, 'message' => $e->getMessage()]);
        }
    }

    if ($method === 'GET' && $route === '/orders/my') {
        $claims = Auth::requireRole('pelanggan');
        $pelangganId = (int) $claims['sub'];

        $stmt = $pdo->prepare(
            'SELECT id, pelanggan_id, kode_pesanan, jenis_pesanan, total, status, tanggal_pesanan
             FROM pesanan WHERE pelanggan_id = ? ORDER BY id DESC'
        );
        $stmt->execute([$pelangganId]);
        $orders = $stmt->fetchAll();

        $detailStmt = $pdo->prepare(
            'SELECT d.id, d.pesanan_id, d.menu_id, m.nama_menu, d.jumlah, d.harga, d.subtotal
             FROM detail_pesanan d
             LEFT JOIN menu m ON m.id = d.menu_id
             WHERE d.pesanan_id = ?'
        );
        $payStmt = $pdo->prepare('SELECT id, pesanan_id, metode, jumlah_bayar, status, tanggal_bayar FROM pembayaran WHERE pesanan_id = ? LIMIT 1');

        foreach ($orders as &$order) {
            $orderId = (int) $order['id'];
            $order['id'] = $orderId;
            $order['pelanggan_id'] = (int) $order['pelanggan_id'];
            $order['total'] = (float) $order['total'];

            $detailStmt->execute([$orderId]);
            $order['items'] = array_map(static function (array $d): array {
                $d['id'] = (int) $d['id'];
                $d['pesanan_id'] = (int) $d['pesanan_id'];
                $d['menu_id'] = (int) $d['menu_id'];
                $d['jumlah'] = (int) $d['jumlah'];
                $d['harga'] = (float) $d['harga'];
                $d['subtotal'] = (float) $d['subtotal'];
                return $d;
            }, $detailStmt->fetchAll());

            $payStmt->execute([$orderId]);
            $pay = $payStmt->fetch();
            if ($pay) {
                $pay['id'] = (int) $pay['id'];
                $pay['pesanan_id'] = (int) $pay['pesanan_id'];
                $pay['jumlah_bayar'] = (float) $pay['jumlah_bayar'];
            }
            $order['pembayaran'] = $pay ?: null;
        }
        unset($order);

        sendJson(200, ['success' => true, 'orders' => $orders]);
    }

    // =========================================================================
    // 6. RESERVASI PELANGGAN (tabel `reservasi`)
    // =========================================================================
    if ($method === 'GET' && $route === '/reservations/my') {
        $claims = Auth::requireRole('pelanggan');
        $stmt = $pdo->prepare(
            'SELECT id, pelanggan_id, tanggal, jam, jumlah_orang, catatan, status
             FROM reservasi WHERE pelanggan_id = ? ORDER BY id DESC'
        );
        $stmt->execute([(int) $claims['sub']]);
        $rows = array_map(static function (array $r): array {
            $r['id'] = (int) $r['id'];
            $r['pelanggan_id'] = (int) $r['pelanggan_id'];
            $r['jumlah_orang'] = (int) $r['jumlah_orang'];
            return $r;
        }, $stmt->fetchAll());
        sendJson(200, ['success' => true, 'reservations' => $rows]);
    }

    if ($method === 'POST' && $route === '/reservations') {
        $claims = Auth::requireRole('pelanggan');
        $body = getJsonBody();
        $tanggal = trim((string) ($body['tanggal'] ?? ''));
        $jam = trim((string) ($body['jam'] ?? ''));
        $jumlahOrang = (int) ($body['jumlah_orang'] ?? 0);
        $catatan = trim((string) ($body['catatan'] ?? ''));

        if ($tanggal === '' || $jam === '' || $jumlahOrang < 1) {
            sendJson(422, ['success' => false, 'message' => 'Tanggal, jam, dan jumlah orang wajib diisi.']);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO reservasi (pelanggan_id, tanggal, jam, jumlah_orang, catatan, status) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([(int) $claims['sub'], $tanggal, $jam, $jumlahOrang, $catatan !== '' ? $catatan : null, 'menunggu']);
        $id = (int) $pdo->lastInsertId();

        sendJson(201, [
            'success' => true,
            'reservation' => [
                'id' => $id,
                'pelanggan_id' => (int) $claims['sub'],
                'tanggal' => $tanggal,
                'jam' => $jam,
                'jumlah_orang' => $jumlahOrang,
                'catatan' => $catatan !== '' ? $catatan : null,
                'status' => 'menunggu',
            ],
        ]);
    }

    // =========================================================================
    // 7. PANEL ADMIN (dilindungi Bearer token role `admin`)
    // =========================================================================
    if (str_starts_with($route, '/admin/')) {
        Auth::requireRole('admin');

        // Dashboard Statistik
        if ($method === 'GET' && $route === '/admin/dashboard') {
            $stats = [
                'total_pesanan' => (int) $pdo->query('SELECT COUNT(*) FROM pesanan')->fetchColumn(),
                'pesanan_menunggu' => (int) $pdo->query("SELECT COUNT(*) FROM pesanan WHERE status = 'menunggu'")->fetchColumn(),
                'pesanan_diproses' => (int) $pdo->query("SELECT COUNT(*) FROM pesanan WHERE status = 'diproses'")->fetchColumn(),
                'pesanan_selesai' => (int) $pdo->query("SELECT COUNT(*) FROM pesanan WHERE status = 'selesai'")->fetchColumn(),
                'total_pendapatan_lunas' => (float) $pdo->query("SELECT COALESCE(SUM(jumlah_bayar), 0) FROM pembayaran WHERE status = 'lunas'")->fetchColumn(),
                'total_menu' => (int) $pdo->query('SELECT COUNT(*) FROM menu')->fetchColumn(),
                'menu_tersedia' => (int) $pdo->query("SELECT COUNT(*) FROM menu WHERE status = 'tersedia'")->fetchColumn(),
                'total_kategori' => (int) $pdo->query('SELECT COUNT(*) FROM kategori_menu')->fetchColumn(),
                'total_pelanggan' => (int) $pdo->query('SELECT COUNT(*) FROM pelanggan')->fetchColumn(),
                'total_warkop' => (int) $pdo->query('SELECT COUNT(*) FROM warkop')->fetchColumn(),
                'total_reservasi' => (int) $pdo->query('SELECT COUNT(*) FROM reservasi')->fetchColumn(),
            ];
            sendJson(200, ['success' => true, 'stats' => $stats]);
        }

        // CRUD Kategori Menu (tabel `kategori_menu`)
        if ($route === '/admin/categories') {
            $body = getJsonBody();
            if ($method === 'POST') {
                $nama = trim((string) ($body['nama_kategori'] ?? ''));
                if ($nama === '') sendJson(422, ['success' => false, 'message' => 'Nama kategori wajib diisi.']);
                $stmt = $pdo->prepare('INSERT INTO kategori_menu (nama_kategori) VALUES (?)');
                $stmt->execute([$nama]);
                sendJson(201, ['success' => true, 'id' => (int) $pdo->lastInsertId()]);
            }
            if ($method === 'PUT') {
                $id = (int) ($body['id'] ?? 0);
                $nama = trim((string) ($body['nama_kategori'] ?? ''));
                if ($id <= 0 || $nama === '') sendJson(422, ['success' => false, 'message' => 'ID dan nama kategori wajib diisi.']);
                $stmt = $pdo->prepare('UPDATE kategori_menu SET nama_kategori = ? WHERE id = ?');
                $stmt->execute([$nama, $id]);
                sendJson(200, ['success' => true]);
            }
            if ($method === 'DELETE') {
                $id = (int) ($_GET['id'] ?? $body['id'] ?? 0);
                $used = $pdo->prepare('SELECT COUNT(*) FROM menu WHERE kategori_id = ?');
                $used->execute([$id]);
                if ((int) $used->fetchColumn() > 0) {
                    sendJson(409, ['success' => false, 'message' => 'Kategori masih digunakan oleh data menu.']);
                }
                $stmt = $pdo->prepare('DELETE FROM kategori_menu WHERE id = ?');
                $stmt->execute([$id]);
                sendJson(200, ['success' => true]);
            }
        }

        // CRUD Menu (tabel `menu`)
        if ($route === '/admin/menu') {
            $body = getJsonBody();
            if ($method === 'POST') {
                $kategoriId = isset($body['kategori_id']) && $body['kategori_id'] !== '' ? (int) $body['kategori_id'] : null;
                $namaMenu = trim((string) ($body['nama_menu'] ?? ''));
                $deskripsi = trim((string) ($body['deskripsi'] ?? ''));
                $harga = (float) ($body['harga'] ?? 0);
                $foto = trim((string) ($body['foto'] ?? ''));
                $status = ($body['status'] ?? 'tersedia') === 'habis' ? 'habis' : 'tersedia';

                if ($namaMenu === '' || $harga <= 0) {
                    sendJson(422, ['success' => false, 'message' => 'Nama menu dan harga valid wajib diisi.']);
                }
                $stmt = $pdo->prepare('INSERT INTO menu (kategori_id, nama_menu, deskripsi, harga, foto, status) VALUES (?, ?, ?, ?, ?, ?)');
                $stmt->execute([$kategoriId, $namaMenu, $deskripsi !== '' ? $deskripsi : null, $harga, $foto !== '' ? $foto : null, $status]);
                sendJson(201, ['success' => true, 'id' => (int) $pdo->lastInsertId()]);
            }
            if ($method === 'PUT') {
                $id = (int) ($body['id'] ?? 0);
                $kategoriId = isset($body['kategori_id']) && $body['kategori_id'] !== '' ? (int) $body['kategori_id'] : null;
                $namaMenu = trim((string) ($body['nama_menu'] ?? ''));
                $deskripsi = trim((string) ($body['deskripsi'] ?? ''));
                $harga = (float) ($body['harga'] ?? 0);
                $foto = trim((string) ($body['foto'] ?? ''));
                $status = ($body['status'] ?? 'tersedia') === 'habis' ? 'habis' : 'tersedia';

                if ($id <= 0 || $namaMenu === '' || $harga <= 0) {
                    sendJson(422, ['success' => false, 'message' => 'Data menu tidak valid.']);
                }
                $stmt = $pdo->prepare('UPDATE menu SET kategori_id = ?, nama_menu = ?, deskripsi = ?, harga = ?, foto = ?, status = ? WHERE id = ?');
                $stmt->execute([$kategoriId, $namaMenu, $deskripsi !== '' ? $deskripsi : null, $harga, $foto !== '' ? $foto : null, $status, $id]);
                sendJson(200, ['success' => true]);
            }
            if ($method === 'DELETE') {
                $id = (int) ($_GET['id'] ?? $body['id'] ?? 0);
                $used = $pdo->prepare('SELECT COUNT(*) FROM detail_pesanan WHERE menu_id = ?');
                $used->execute([$id]);
                if ((int) $used->fetchColumn() > 0) {
                    sendJson(409, ['success' => false, 'message' => 'Menu sudah memiliki riwayat transaksi pesanan. Ubah status menjadi habis sebagai gantinya.']);
                }
                $stmt = $pdo->prepare('DELETE FROM menu WHERE id = ?');
                $stmt->execute([$id]);
                sendJson(200, ['success' => true]);
            }
        }

        // CRUD Usaha Kuliner & Koordinat (tabel `warkop`)
        if ($route === '/admin/warkop') {
            $body = getJsonBody();
            if ($method === 'POST') {
                $nama = trim((string) ($body['nama'] ?? ''));
                $alamat = trim((string) ($body['alamat'] ?? ''));
                $lat = isset($body['latitude']) && $body['latitude'] !== '' ? (float) $body['latitude'] : null;
                $lng = isset($body['longitude']) && $body['longitude'] !== '' ? (float) $body['longitude'] : null;
                $deskripsi = trim((string) ($body['deskripsi'] ?? ''));
                $telepon = trim((string) ($body['telepon'] ?? ''));
                if ($nama === '') sendJson(422, ['success' => false, 'message' => 'Nama usaha kuliner wajib diisi.']);
                $stmt = $pdo->prepare('INSERT INTO warkop (nama, alamat, latitude, longitude, deskripsi, telepon) VALUES (?, ?, ?, ?, ?, ?)');
                $stmt->execute([$nama, $alamat !== '' ? $alamat : null, $lat, $lng, $deskripsi !== '' ? $deskripsi : null, $telepon !== '' ? $telepon : null]);
                sendJson(201, ['success' => true, 'id' => (int) $pdo->lastInsertId()]);
            }
            if ($method === 'PUT') {
                $id = (int) ($body['id'] ?? 0);
                $nama = trim((string) ($body['nama'] ?? ''));
                $alamat = trim((string) ($body['alamat'] ?? ''));
                $lat = isset($body['latitude']) && $body['latitude'] !== '' ? (float) $body['latitude'] : null;
                $lng = isset($body['longitude']) && $body['longitude'] !== '' ? (float) $body['longitude'] : null;
                $deskripsi = trim((string) ($body['deskripsi'] ?? ''));
                $telepon = trim((string) ($body['telepon'] ?? ''));
                if ($id <= 0 || $nama === '') sendJson(422, ['success' => false, 'message' => 'ID dan nama usaha kuliner wajib diisi.']);
                $stmt = $pdo->prepare('UPDATE warkop SET nama = ?, alamat = ?, latitude = ?, longitude = ?, deskripsi = ?, telepon = ? WHERE id = ?');
                $stmt->execute([$nama, $alamat !== '' ? $alamat : null, $lat, $lng, $deskripsi !== '' ? $deskripsi : null, $telepon !== '' ? $telepon : null, $id]);
                sendJson(200, ['success' => true]);
            }
            if ($method === 'DELETE') {
                $id = (int) ($_GET['id'] ?? $body['id'] ?? 0);
                $stmt = $pdo->prepare('DELETE FROM warkop WHERE id = ?');
                $stmt->execute([$id]);
                sendJson(200, ['success' => true]);
            }
        }

        // Kelola Pelanggan (tabel `pelanggan`)
        if ($route === '/admin/customers') {
            if ($method === 'GET') {
                $rows = $pdo->query('SELECT id, nama, telepon, email, alamat FROM pelanggan ORDER BY id DESC')->fetchAll();
                foreach ($rows as &$r) $r['id'] = (int) $r['id'];
                sendJson(200, ['success' => true, 'customers' => $rows]);
            }
            $body = getJsonBody();
            if ($method === 'PUT') {
                $id = (int) ($body['id'] ?? 0);
                $nama = trim((string) ($body['nama'] ?? ''));
                $telepon = normalizePhone((string) ($body['telepon'] ?? ''));
                $email = trim((string) ($body['email'] ?? ''));
                $alamat = trim((string) ($body['alamat'] ?? ''));
                if ($id <= 0 || $nama === '' || $telepon === '') sendJson(422, ['success' => false, 'message' => 'Data pelanggan tidak lengkap.']);
                $stmt = $pdo->prepare('UPDATE pelanggan SET nama = ?, telepon = ?, email = ?, alamat = ? WHERE id = ?');
                $stmt->execute([$nama, $telepon, $email !== '' ? $email : null, $alamat !== '' ? $alamat : null, $id]);
                sendJson(200, ['success' => true]);
            }
            if ($method === 'DELETE') {
                $id = (int) ($_GET['id'] ?? $body['id'] ?? 0);
                $usedOrder = $pdo->prepare('SELECT COUNT(*) FROM pesanan WHERE pelanggan_id = ?');
                $usedOrder->execute([$id]);
                if ((int) $usedOrder->fetchColumn() > 0) {
                    sendJson(409, ['success' => false, 'message' => 'Pelanggan memiliki riwayat pesanan dan tidak dapat dihapus.']);
                }
                $stmt = $pdo->prepare('DELETE FROM pelanggan WHERE id = ?');
                $stmt->execute([$id]);
                sendJson(200, ['success' => true]);
            }
        }

        // Kelola Pesanan (tabel `pesanan`, `detail_pesanan`, `pembayaran`)
        if ($route === '/admin/orders') {
            if ($method === 'GET') {
                $orders = $pdo->query(
                    'SELECT p.id, p.pelanggan_id, pl.nama AS pelanggan_nama, pl.telepon AS pelanggan_telepon,
                            p.kode_pesanan, p.jenis_pesanan, p.total, p.status, p.tanggal_pesanan
                     FROM pesanan p
                     LEFT JOIN pelanggan pl ON pl.id = p.pelanggan_id
                     ORDER BY p.id DESC'
                )->fetchAll();

                $detailStmt = $pdo->prepare(
                    'SELECT d.id, d.pesanan_id, d.menu_id, m.nama_menu, d.jumlah, d.harga, d.subtotal
                     FROM detail_pesanan d LEFT JOIN menu m ON m.id = d.menu_id WHERE d.pesanan_id = ?'
                );
                $payStmt = $pdo->prepare('SELECT id, pesanan_id, metode, jumlah_bayar, status, tanggal_bayar FROM pembayaran WHERE pesanan_id = ? LIMIT 1');

                foreach ($orders as &$order) {
                    $oid = (int) $order['id'];
                    $order['id'] = $oid;
                    $order['pelanggan_id'] = (int) $order['pelanggan_id'];
                    $order['total'] = (float) $order['total'];
                    $detailStmt->execute([$oid]);
                    $order['items'] = $detailStmt->fetchAll();
                    $payStmt->execute([$oid]);
                    $order['pembayaran'] = $payStmt->fetch() ?: null;
                }
                sendJson(200, ['success' => true, 'orders' => $orders]);
            }
            if ($method === 'PUT') {
                $body = getJsonBody();
                $id = (int) ($body['id'] ?? 0);
                $status = (string) ($body['status'] ?? '');
                $allowed = ['menunggu', 'diproses', 'selesai', 'dibatalkan'];
                if ($id <= 0 || !in_array($status, $allowed, true)) {
                    sendJson(422, ['success' => false, 'message' => 'Status pesanan tidak valid.']);
                }
                $stmt = $pdo->prepare('UPDATE pesanan SET status = ? WHERE id = ?');
                $stmt->execute([$status, $id]);
                sendJson(200, ['success' => true]);
            }
        }

        // Kelola Pembayaran (tabel `pembayaran`)
        if ($route === '/admin/payments') {
            if ($method === 'GET') {
                $rows = $pdo->query(
                    'SELECT pb.id, pb.pesanan_id, p.kode_pesanan, pl.nama AS pelanggan_nama,
                            pb.metode, pb.jumlah_bayar, pb.status, pb.tanggal_bayar
                     FROM pembayaran pb
                     LEFT JOIN pesanan p ON p.id = pb.pesanan_id
                     LEFT JOIN pelanggan pl ON pl.id = p.pelanggan_id
                     ORDER BY pb.id DESC'
                )->fetchAll();
                sendJson(200, ['success' => true, 'payments' => $rows]);
            }
            if ($method === 'PUT') {
                $body = getJsonBody();
                $id = (int) ($body['id'] ?? 0);
                $status = (string) ($body['status'] ?? '');
                $allowed = ['belum_bayar', 'menunggu_verifikasi', 'lunas', 'gagal'];
                if ($id <= 0 || !in_array($status, $allowed, true)) {
                    sendJson(422, ['success' => false, 'message' => 'Status pembayaran tidak valid.']);
                }
                $tanggalBayar = $status === 'lunas' ? date('Y-m-d H:i:s') : null;
                $stmt = $pdo->prepare('UPDATE pembayaran SET status = ?, tanggal_bayar = ? WHERE id = ?');
                $stmt->execute([$status, $tanggalBayar, $id]);
                sendJson(200, ['success' => true]);
            }
        }

        // Kelola Reservasi (tabel `reservasi`)
        if ($route === '/admin/reservations') {
            if ($method === 'GET') {
                $rows = $pdo->query(
                    'SELECT r.id, r.pelanggan_id, pl.nama AS pelanggan_nama, pl.telepon AS pelanggan_telepon,
                            r.tanggal, r.jam, r.jumlah_orang, r.catatan, r.status
                     FROM reservasi r
                     LEFT JOIN pelanggan pl ON pl.id = r.pelanggan_id
                     ORDER BY r.id DESC'
                )->fetchAll();
                sendJson(200, ['success' => true, 'reservations' => $rows]);
            }
            if ($method === 'PUT') {
                $body = getJsonBody();
                $id = (int) ($body['id'] ?? 0);
                $status = (string) ($body['status'] ?? '');
                $allowed = ['menunggu', 'dikonfirmasi', 'ditolak', 'selesai', 'dibatalkan'];
                if ($id <= 0 || !in_array($status, $allowed, true)) {
                    sendJson(422, ['success' => false, 'message' => 'Status reservasi tidak valid.']);
                }
                $stmt = $pdo->prepare('UPDATE reservasi SET status = ? WHERE id = ?');
                $stmt->execute([$status, $id]);
                sendJson(200, ['success' => true]);
            }
        }
    }

    sendJson(404, ['success' => false, 'message' => 'Endpoint tidak ditemukan: ' . $route]);
} catch (Throwable $e) {
    sendJson(500, ['success' => false, 'message' => 'Terjadi kesalahan server: ' . $e->getMessage()]);
}
