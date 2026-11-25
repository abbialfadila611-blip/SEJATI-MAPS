<?php
declare(strict_types=1);

/**
 * Pengelola token Bearer HMAC-SHA256 untuk pelanggan dan admin SEJATI MAPS.
 */
final class Auth
{
    private static function secret(): string
    {
        $envSecret = getenv('APP_AUTH_SECRET');
        if (is_string($envSecret) && strlen($envSecret) >= 16) {
            return $envSecret;
        }
        // Fallback deterministik per mesin saat development Laragon lokal
        return hash('sha256', __FILE__ . '|sejati_maps_local_dev');
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $padding = strlen($data) % 4;
        if ($padding > 0) {
            $data .= str_repeat('=', 4 - $padding);
        }
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);
        return $decoded === false ? '' : $decoded;
    }

    public static function issueToken(array $claims, int $ttlSeconds = 86400): string
    {
        $header = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $claims['iat'] = time();
        $claims['exp'] = time() + $ttlSeconds;
        $payload = self::base64UrlEncode(json_encode($claims, JSON_THROW_ON_ERROR));
        $signature = self::base64UrlEncode(hash_hmac('sha256', $header . '.' . $payload, self::secret(), true));
        return $header . '.' . $payload . '.' . $signature;
    }

    public static function verifyToken(?string $token): ?array
    {
        if (!$token) {
            return null;
        }
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        [$header, $payload, $signature] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', $header . '.' . $payload, self::secret(), true));
        if (!hash_equals($expected, $signature)) {
            return null;
        }
        $decoded = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($decoded) || !isset($decoded['exp']) || (int) $decoded['exp'] < time()) {
            return null;
        }
        return $decoded;
    }

    public static function getBearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
        if (preg_match('/Bearer\s+(\S+)/i', $header, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public static function requireRole(string $role): array
    {
        $claims = self::verifyToken(self::getBearerToken());
        if (!$claims || ($claims['role'] ?? null) !== $role) {
            http_response_code(401);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'message' => $role === 'admin'
                    ? 'Akses admin ditolak. Silakan login sebagai admin.'
                    : 'Sesi pelanggan tidak valid. Silakan login terlebih dahulu.',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        return $claims;
    }
}
