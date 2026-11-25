<?php
declare(strict_types=1);

/**
 * Konfigurasi kredensial dan parameter koneksi database MySQL untuk SEJATI MAPS.
 * Nilai dapat diubah langsung di file ini atau melalui environment variable.
 * Jangan pernah mencetak atau mengekspos nilai `password` ke respons HTTP.
 */
return [
    'host'     => getenv('DB_HOST') ?: 'localhost',
    'port'     => (int) (getenv('DB_PORT') ?: 3306),
    'dbname'   => getenv('DB_NAME') ?: 'sejati_maps',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') !== false ? (string) getenv('DB_PASS') : '',
    'charset'  => 'utf8mb4',
];
