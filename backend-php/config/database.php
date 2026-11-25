<?php
declare(strict_types=1);

/**
 * Mengembalikan array konfigurasi database tanpa nilai sensitif password.
 *
 * @return array{host: string, port: int, dbname: string, charset: string}
 */
function getPublicDbInfo(): array
{
    /** @var array{host: string, port: int, dbname: string, username: string, password: string, charset: string} $config */
    $config = require __DIR__ . '/db_config.php';

    return [
        'host'    => (string) $config['host'],
        'port'    => (int) $config['port'],
        'dbname'  => (string) $config['dbname'],
        'charset' => (string) $config['charset'],
    ];
}

/**
 * Membuka koneksi PDO MySQL ke database `sejati_maps` dengan error handling aman.
 *
 * @throws RuntimeException apabila koneksi PDO gagal tanpa membocorkan kredensial.
 */
function getDbConnection(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    /** @var array{host: string, port: int, dbname: string, username: string, password: string, charset: string} $config */
    $config = require __DIR__ . '/db_config.php';

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $config['host'],
        (int) $config['port'],
        $config['dbname'],
        $config['charset']
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log('[SEJATI MAPS DB ERROR] Kode SQLSTATE: ' . $e->getCode());
        throw new RuntimeException(
            'Koneksi ke database MySQL gagal. Periksa layanan MySQL di Laragon dan konfigurasi host, port, atau nama database.'
        );
    }
}
