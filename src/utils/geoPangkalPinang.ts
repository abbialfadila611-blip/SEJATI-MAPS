// Batas wilayah administratif Kota Pangkal Pinang, Kepulauan Bangka Belitung
// Mencakup 7 kecamatan: Gabek, Pangkal Balam, Gerunggang, Taman Sari, Rangkui, Girimaya, Bukit Intan

export const PANGKAL_PINANG_CENTER: [number, number] = [-2.1316, 106.1169];

// Koordinat poligon [latitude, longitude] untuk Leaflet & algoritma Ray-Casting
export const PANGKAL_PINANG_POLYGON: [number, number][] = [
  [-2.0755, 106.0935], // Utara - Selindung / Gabek Utara
  [-2.0738, 106.1225], // Timur Laut - Muara Pangkal Balam
  [-2.0885, 106.1485], // Pesisir Ketapang
  [-2.1135, 106.1695], // Pesisir Pasir Padi Utara
  [-2.1435, 106.1782], // Pesisir Pasir Padi Selatan
  [-2.1725, 106.1705], // Temberan / Air Itam Timur
  [-2.1945, 106.1480], // Air Itam Selatan / Bukit Intan
  [-2.1915, 106.1145], // Semabung Lama / Girimaya Selatan
  [-2.1760, 106.0865], // Bacang / Perbatasan Bangka Tengah
  [-2.1555, 106.0655], // Barat Daya - Kejaksaan / Rangkui Barat
  [-2.1295, 106.0545], // Barat - Tuatunu Indah / Gerunggang
  [-2.1045, 106.0620], // Barat Laut - Kacang Pedang / Tua Tunu
  [-2.0865, 106.0775], // Jerambah Gantung
];

export const PANGKAL_PINANG_DISTRICTS: Array<{
  name: string;
  lat: number;
  lng: number;
}> = [
  { name: 'Kec. Rangkui', lat: -2.1338, lng: 106.1035 },
  { name: 'Kec. Taman Sari', lat: -2.1230, lng: 106.1145 },
  { name: 'Kec. Pangkal Balam', lat: -2.1055, lng: 106.1285 },
  { name: 'Kec. Gabek', lat: -2.0940, lng: 106.1050 },
  { name: 'Kec. Gerunggang', lat: -2.1210, lng: 106.0790 },
  { name: 'Kec. Girimaya', lat: -2.1485, lng: 106.1195 },
  { name: 'Kec. Bukit Intan', lat: -2.1565, lng: 106.1460 },
];

export function isPointInPangkalPinang(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

  let inside = false;
  const poly = PANGKAL_PINANG_POLYGON;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function estimateDistrict(lat: number, lng: number): string | null {
  if (!isPointInPangkalPinang(lat, lng)) return null;
  let closest = PANGKAL_PINANG_DISTRICTS[0];
  let bestDist = Infinity;
  for (const d of PANGKAL_PINANG_DISTRICTS) {
    const dist = haversineDistanceKm(lat, lng, d.lat, d.lng);
    if (dist < bestDist) {
      bestDist = dist;
      closest = d;
    }
  }
  return closest.name;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
