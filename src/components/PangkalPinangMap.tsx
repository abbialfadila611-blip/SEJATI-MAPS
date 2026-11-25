import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { Warkop } from '../types';
import {
  PANGKAL_PINANG_CENTER,
  PANGKAL_PINANG_POLYGON,
  haversineDistanceKm,
  isPointInPangkalPinang,
} from '../utils/geoPangkalPinang';

interface PangkalPinangMapProps {
  warkopList: Warkop[];
  customerPosition?: { latitude: number; longitude: number } | null;
  pickMode?: boolean;
  pickedCoordinate?: { latitude: number; longitude: number } | null;
  onSelectPoint?: (lat: number, lng: number) => void;
  focusPoint?: { latitude: number; longitude: number } | null;
  heightClass?: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function PangkalPinangMap({
  warkopList,
  customerPosition,
  pickMode = false,
  pickedCoordinate,
  onSelectPoint,
  focusPoint,
  heightClass = 'h-[420px]',
}: PangkalPinangMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectPoint);
  const pickModeRef = useRef(pickMode);

  onSelectRef.current = onSelectPoint;
  pickModeRef.current = pickMode;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: PANGKAL_PINANG_CENTER,
      zoom: 13,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Poligon batas wilayah administratif Kota Pangkal Pinang
    L.polygon(PANGKAL_PINANG_POLYGON, {
      color: '#14532D',
      weight: 2,
      dashArray: '6 4',
      fillColor: '#14532D',
      fillOpacity: 0.08,
    })
      .bindTooltip('Batas Layanan: Kota Pangkal Pinang', { sticky: true })
      .addTo(map);

    const group = L.layerGroup().addTo(map);
    layerGroupRef.current = group;
    mapRef.current = map;

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (pickModeRef.current && onSelectRef.current) {
        onSelectRef.current(
          Number(e.latlng.lat.toFixed(7)),
          Number(e.latlng.lng.toFixed(7))
        );
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();
    container.style.cursor = pickMode ? 'crosshair' : '';
  }, [pickMode]);

  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    // Marker usaha kuliner (tabel warkop)
    for (const w of warkopList) {
      if (w.latitude === null || w.longitude === null) continue;
      const distText =
        customerPosition
          ? `${haversineDistanceKm(
              customerPosition.latitude,
              customerPosition.longitude,
              w.latitude,
              w.longitude
            )} km dari lokasi Anda`
          : '';

      const icon = L.divIcon({
        className: 'sejati-warkop-pin',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#14532D;color:#fff;border:2px solid #fff;box-shadow:0 4px 12px rgba(20,83,45,0.35);font-weight:700;font-size:13px;">S</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });

      const popupHtml = `
        <div style="min-width:210px;font-family:'Plus Jakarta Sans',sans-serif;">
          <div style="font-weight:700;font-size:14px;color:#1C1917;margin-bottom:4px;">${escapeHtml(w.nama)}</div>
          <div style="font-size:12px;color:#57534E;line-height:1.45;margin-bottom:6px;">${escapeHtml(w.alamat ?? 'Kota Pangkal Pinang')}</div>
          ${w.telepon ? `<div style="font-size:12px;color:#1C1917;margin-bottom:4px;">Telp: ${escapeHtml(w.telepon)}</div>` : ''}
          ${distText ? `<div style="font-size:12px;font-weight:600;color:#14532D;">${escapeHtml(distText)}</div>` : ''}
          <div style="font-size:11px;font-family:'JetBrains Mono',monospace;color:#78716C;margin-top:4px;">${w.latitude.toFixed(6)}, ${w.longitude.toFixed(6)}</div>
        </div>
      `;

      L.marker([w.latitude, w.longitude], { icon })
        .bindPopup(popupHtml)
        .addTo(group);
    }

    // Marker GPS Pelanggan
    if (customerPosition) {
      const inside = isPointInPangkalPinang(
        customerPosition.latitude,
        customerPosition.longitude
      );
      const color = inside ? '#0F766E' : '#B91C1C';
      const statusLabel = inside
        ? 'Lokasi Anda (Dalam Pangkal Pinang)'
        : 'Lokasi Anda (Di Luar Pangkal Pinang)';

      const gpsIcon = L.divIcon({
        className: 'sejati-gps-pin',
        html: `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 0 0 4px ${inside ? 'rgba(15,118,110,0.22)' : 'rgba(185,28,28,0.25)'};"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([customerPosition.latitude, customerPosition.longitude], {
        icon: gpsIcon,
      })
        .bindPopup(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;">
            <strong style="color:${color};">${escapeHtml(statusLabel)}</strong><br/>
            <span style="font-family:'JetBrains Mono',monospace;">${customerPosition.latitude.toFixed(6)}, ${customerPosition.longitude.toFixed(6)}</span>
          </div>`
        )
        .addTo(group);
    }

    // Marker pilihan admin untuk koordinat usaha kuliner
    if (pickedCoordinate) {
      const pickIcon = L.divIcon({
        className: 'sejati-pick-pin',
        html: `<div style="width:22px;height:22px;border-radius:6px;background:#B45309;border:2px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.25);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([pickedCoordinate.latitude, pickedCoordinate.longitude], {
        icon: pickIcon,
      })
        .bindTooltip('Titik Koordinat Dipilih')
        .addTo(group);
    }
  }, [warkopList, customerPosition, pickedCoordinate]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusPoint) return;
    map.flyTo([focusPoint.latitude, focusPoint.longitude], 14, { duration: 0.6 });
  }, [focusPoint]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden rounded-xl border border-[#E6E4DF] bg-[#F3F1EC] ${heightClass}`}
      aria-label="Peta Digital Kota Pangkal Pinang"
    />
  );
}
