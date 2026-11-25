import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface GpsPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'capacitor' | 'browser' | 'manual';
}

export async function detectCurrentPosition(): Promise<GpsPosition> {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.requestPermissions();
    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
      throw new Error('Izin akses lokasi GPS ditolak oleh perangkat Android.');
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      source: 'capacitor',
    };
  }

  if (!('geolocation' in navigator)) {
    throw new Error('Peramban tidak mendukung deteksi GPS Geolocation.');
  }

  return new Promise<GpsPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: 'browser',
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('Izin lokasi ditolak. Aktifkan izin lokasi browser atau pilih titik di peta.'));
        } else if (err.code === err.TIMEOUT) {
          reject(new Error('Waktu deteksi GPS habis. Silakan coba lagi atau pilih titik di peta.'));
        } else {
          reject(new Error('Sinyal GPS tidak tersedia saat ini.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  });
}
