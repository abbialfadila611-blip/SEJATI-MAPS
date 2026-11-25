import {
  CheckCircle2,
  Compass,
  Crosshair,
  MapPin,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import type { GeoValidationResult, Warkop } from '../types';
import { haversineDistanceKm } from '../utils/geoPangkalPinang';
import { PangkalPinangMap } from './PangkalPinangMap';

interface MapExplorerViewProps {
  warkopList: Warkop[];
  customerPosition: { latitude: number; longitude: number } | null;
  geoResult: GeoValidationResult | null;
  gpsLoading: boolean;
  gpsError: string | null;
  onDetectGps: () => void;
  onSetManualCoordinate: (lat: number, lng: number) => void;
}

const PRESET_LOCATIONS = [
  { label: 'Pasar Mambo, Rangkui (Dalam Kota)', lat: -2.1305, lng: 106.1128 },
  { label: 'Pantai Pasir Padi, Bukit Intan (Dalam Kota)', lat: -2.1268, lng: 106.1712 },
  { label: 'Sungailiat, Kab. Bangka (Luar Wilayah)', lat: -1.8562, lng: 106.1155 },
  { label: 'Koba, Bangka Tengah (Luar Wilayah)', lat: -2.4915, lng: 106.4125 },
];

export function MapExplorerView({
  warkopList,
  customerPosition,
  geoResult,
  gpsLoading,
  gpsError,
  onDetectGps,
  onSetManualCoordinate,
}: MapExplorerViewProps) {
  const [pickOnMap, setPickOnMap] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  const handleSelectMapPoint = (lat: number, lng: number) => {
    onSetManualCoordinate(lat, lng);
    setFocusPoint({ latitude: lat, longitude: lng });
    setPickOnMap(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#E6E4DF] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1C1917]">
            Peta Lokasi Kuliner &amp; Jangkauan GPS
          </h1>
          <p className="mt-1 text-sm text-[#57534E]">
            Batas wilayah layanan administratif Kota Pangkal Pinang ditampilkan dengan poligon hijau.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onDetectGps}
            disabled={gpsLoading}
            className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166534] disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <Compass className="h-4 w-4" />
            <span>{gpsLoading ? 'Mendeteksi GPS...' : 'Deteksi GPS Perangkat'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPickOnMap((p) => !p)}
            className={`inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              pickOnMap
                ? 'border-[#B45309] bg-[#FEF3C7] text-[#92400E]'
                : 'border-[#E6E4DF] bg-white text-[#1C1917] hover:bg-[#F3F1EC]'
            }`}
          >
            <Crosshair className="h-4 w-4" />
            <span>{pickOnMap ? 'Klik Titik di Peta...' : 'Pilih Titik di Peta'}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PangkalPinangMap
            warkopList={warkopList}
            customerPosition={customerPosition}
            pickMode={pickOnMap}
            onSelectPoint={handleSelectMapPoint}
            focusPoint={focusPoint}
            heightClass="h-[460px] sm:h-[520px]"
          />

          {/* Panel Uji Koordinat Batas Wilayah */}
          <div className="mt-4 rounded-xl border border-[#E6E4DF] bg-white p-4">
            <p className="text-xs font-semibold text-[#1C1917]">
              Uji Titik Koordinat Wilayah (Simulasi Dalam &amp; Luar Pangkal Pinang)
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    onSetManualCoordinate(preset.lat, preset.lng);
                    setFocusPoint({ latitude: preset.lat, longitude: preset.lng });
                  }}
                  className="min-h-[36px] cursor-pointer rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#F3F1EC]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:col-span-4">
          {/* Status Validasi Geospasial */}
          <div className="rounded-xl border border-[#E6E4DF] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#1C1917]">
              Validasi Wilayah Layanan
            </h2>

            {gpsError && (
              <p className="mt-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C]">
                {gpsError}
              </p>
            )}

            {geoResult ? (
              <div className="mt-3 space-y-3">
                <div
                  className={`flex items-start gap-2.5 rounded-lg border p-3.5 ${
                    geoResult.valid
                      ? 'border-[#BBF7D0] bg-[#F0FDF4]'
                      : 'border-[#FECACA] bg-[#FEF2F2]'
                  }`}
                >
                  {geoResult.valid ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#14532D]" />
                  ) : (
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        geoResult.valid ? 'text-[#14532D]' : 'text-[#B91C1C]'
                      }`}
                    >
                      {geoResult.valid
                        ? 'Wilayah Layanan Valid'
                        : 'Di Luar Wilayah Pangkal Pinang'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                      {geoResult.message}
                    </p>
                  </div>
                </div>

                <dl className="space-y-2 border-t border-[#E6E4DF] pt-3 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#78716C]">Koordinat Anda</dt>
                    <dd className="font-mono tabular-nums font-medium text-[#1C1917]">
                      {geoResult.latitude.toFixed(6)}, {geoResult.longitude.toFixed(6)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#78716C]">Kecamatan</dt>
                    <dd className="font-medium text-[#1C1917]">
                      {geoResult.kecamatan_estimasi ?? 'Di luar Pangkal Pinang'}
                    </dd>
                  </div>
                  {geoResult.nearest_warkop && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#78716C]">Jarak ke Outlet</dt>
                      <dd className="font-mono tabular-nums font-medium text-[#14532D]">
                        {geoResult.nearest_warkop.distance_km} km
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                Tekan tombol <strong>Deteksi GPS Perangkat</strong> atau pilih titik pada peta
                untuk memverifikasi apakah posisi Anda berada di dalam Kota Pangkal Pinang.
              </p>
            )}
          </div>

          {/* Daftar Usaha Kuliner */}
          <div className="rounded-xl border border-[#E6E4DF] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#1C1917]">
              Informasi Usaha Kuliner ({warkopList.length})
            </h2>
            <div className="mt-3 divide-y divide-[#E6E4DF]">
              {warkopList.map((w) => {
                const dist =
                  customerPosition && w.latitude !== null && w.longitude !== null
                    ? haversineDistanceKm(
                        customerPosition.latitude,
                        customerPosition.longitude,
                        w.latitude,
                        w.longitude
                      )
                    : null;

                return (
                  <div key={w.id} className="py-3.5 first:pt-1 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#1C1917]">{w.nama}</h3>
                      {dist !== null && (
                        <span className="font-mono tabular-nums text-xs font-medium text-[#14532D]">
                          {dist} km
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                      {w.alamat ?? 'Kota Pangkal Pinang'}
                    </p>
                    {w.deskripsi && (
                      <p className="mt-1.5 text-xs text-[#78716C]">{w.deskripsi}</p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-[#57534E]">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{w.telepon || 'Tersedia di lokasi'}</span>
                      </span>
                      {w.latitude !== null && w.longitude !== null && (
                        <button
                          type="button"
                          onClick={() =>
                            setFocusPoint({
                              latitude: w.latitude as number,
                              longitude: w.longitude as number,
                            })
                          }
                          className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#14532D] hover:underline"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Fokus Peta</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
