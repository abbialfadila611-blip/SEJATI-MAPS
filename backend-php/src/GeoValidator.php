<?php
declare(strict_types=1);

/**
 * Validator geospasial backend untuk wilayah administratif Kota Pangkal Pinang,
 * Provinsi Kepulauan Bangka Belitung (7 kecamatan).
 */
final class GeoValidator
{
    private const PANGKAL_PINANG_POLYGON = [
        [-2.0755, 106.0935],
        [-2.0738, 106.1225],
        [-2.0885, 106.1485],
        [-2.1135, 106.1695],
        [-2.1435, 106.1782],
        [-2.1725, 106.1705],
        [-2.1945, 106.1480],
        [-2.1915, 106.1145],
        [-2.1760, 106.0865],
        [-2.1555, 106.0655],
        [-2.1295, 106.0545],
        [-2.1045, 106.0620],
        [-2.0865, 106.0775],
    ];

    private const DISTRICTS = [
        ['name' => 'Kec. Rangkui', 'lat' => -2.1338, 'lng' => 106.1035],
        ['name' => 'Kec. Taman Sari', 'lat' => -2.1230, 'lng' => 106.1145],
        ['name' => 'Kec. Pangkal Balam', 'lat' => -2.1055, 'lng' => 106.1285],
        ['name' => 'Kec. Gabek', 'lat' => -2.0940, 'lng' => 106.1050],
        ['name' => 'Kec. Gerunggang', 'lat' => -2.1210, 'lng' => 106.0790],
        ['name' => 'Kec. Girimaya', 'lat' => -2.1485, 'lng' => 106.1195],
        ['name' => 'Kec. Bukit Intan', 'lat' => -2.1565, 'lng' => 106.1460],
    ];

    public static function isInsidePangkalPinang(float $lat, float $lng): bool
    {
        if (!is_finite($lat) || !is_finite($lng)) {
            return false;
        }

        $inside = false;
        $poly = self::PANGKAL_PINANG_POLYGON;
        $count = count($poly);

        for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
            $xi = $poly[$i][0];
            $yi = $poly[$i][1];
            $xj = $poly[$j][0];
            $yj = $poly[$j][1];

            $intersect = (($yi > $lng) !== ($yj > $lng))
                && ($lat < ($xj - $xi) * ($lng - $yi) / ($yj - $yi) + $xi);

            if ($intersect) {
                $inside = !$inside;
            }
        }

        return $inside;
    }

    public static function haversineDistanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadiusKm = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadiusKm * $c, 2);
    }

    public static function estimateDistrict(float $lat, float $lng): ?string
    {
        if (!self::isInsidePangkalPinang($lat, $lng)) {
            return null;
        }

        $closest = null;
        $bestDist = INF;
        foreach (self::DISTRICTS as $district) {
            $dist = self::haversineDistanceKm($lat, $lng, $district['lat'], $district['lng']);
            if ($dist < $bestDist) {
                $bestDist = $dist;
                $closest = $district['name'];
            }
        }
        return $closest;
    }
}
