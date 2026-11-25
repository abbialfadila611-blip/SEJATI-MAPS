<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Metode tidak diizinkan. Gunakan metode GET.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$dbInfo = getPublicDbInfo();

try {
    $pdo = getDbConnection();

    $metaStmt = $pdo->query('SELECT DATABASE() AS active_database, VERSION() AS mysql_version');
    $meta = $metaStmt->fetch() ?: [];

    $tablesStmt = $pdo->query('SHOW TABLES');
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    http_response_code(200);
    echo json_encode([
        'success'         => true,
        'message'         => 'Koneksi PDO ke database MySQL berhasil.',
        'host'            => $dbInfo['host'],
        'port'            => $dbInfo['port'],
        'database'        => $meta['active_database'] ?? $dbInfo['dbname'],
        'charset'         => $dbInfo['charset'],
        'mysql_version'   => $meta['mysql_version'] ?? null,
        'total_tables'    => count($tables),
        'tables'          => $tables,
        'checked_at'      => date('c'),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success'  => false,
        'message'  => $e instanceof RuntimeException
            ? $e->getMessage()
            : 'Gagal menguji koneksi database MySQL.',
        'host'     => $dbInfo['host'],
        'port'     => $dbInfo['port'],
        'database' => $dbInfo['dbname'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
}
