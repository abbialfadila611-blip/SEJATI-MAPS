import { Capacitor } from '@capacitor/core';
import { INITIAL_KATEGORI, INITIAL_MENU, INITIAL_WARKOP } from '../../server/seedData';
import type {
  AdminUser,
  DashboardStats,
  GeoValidationResult,
  JenisPesanan,
  KategoriMenu,
  MenuItem,
  MenuStatus,
  Pelanggan,
  Pembayaran,
  Pesanan,
  Reservasi,
  StatusPembayaran,
  StatusPesanan,
  StatusReservasi,
  Warkop,
} from '../types';
import {
  estimateDistrict,
  haversineDistanceKm,
  isPointInPangkalPinang,
} from '../utils/geoPangkalPinang';

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';
export const API_BASE = RAW_BASE ? RAW_BASE.replace(/\/+$/, '') : '/api';
export const IS_PHP_BACKEND = Boolean(RAW_BASE);

function getBundledCatalog(): {
  kategori: KategoriMenu[];
  menu: MenuItem[];
  warkop: Warkop[];
} {
  const catMap = new Map(INITIAL_KATEGORI.map((k) => [k.id, k.nama_kategori]));
  return {
    kategori: INITIAL_KATEGORI,
    menu: INITIAL_MENU.map((m) => ({
      ...m,
      nama_kategori: m.kategori_id ? catMap.get(m.kategori_id) : undefined,
    })),
    warkop: INITIAL_WARKOP,
  };
}

function validateGeoLocally(lat: number, lng: number): GeoValidationResult {
  const valid = isPointInPangkalPinang(lat, lng);
  const kecamatan = estimateDistrict(lat, lng);
  let nearest: { id: number; nama: string; distance_km: number } | null = null;
  let bestDist = Infinity;

  for (const w of INITIAL_WARKOP) {
    if (w.latitude !== null && w.longitude !== null) {
      const dist = haversineDistanceKm(lat, lng, w.latitude, w.longitude);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = { id: w.id, nama: w.nama, distance_km: dist };
      }
    }
  }

  return {
    valid,
    latitude: lat,
    longitude: lng,
    region: 'Kota Pangkal Pinang',
    kecamatan_estimasi: kecamatan,
    message: valid
      ? `Lokasi Anda berada dalam wilayah layanan Kota Pangkal Pinang (${kecamatan ?? 'Pangkal Pinang'}).`
      : 'Lokasi Anda berada di luar batas wilayah layanan administratif Kota Pangkal Pinang.',
    nearest_warkop: nearest,
  };
}

async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    if (Capacitor.isNativePlatform() && !RAW_BASE) {
      throw new Error(
        'Mode APK offline: fitur transaksi memerlukan URL server API (VITE_API_BASE_URL) yang terhubung ke database MySQL sejati_maps.'
      );
    }
    throw new Error('Tidak dapat terhubung ke server API SEJATI MAPS.');
  }

  let parsedBody: unknown = null;
  try {
    parsedBody = await res.json();
  } catch {
    parsedBody = null;
  }

  if (!parsedBody || typeof parsedBody !== 'object') {
    if (Capacitor.isNativePlatform() && !RAW_BASE) {
      throw new Error(
        'APK belum terhubung ke server API MySQL sejati_maps (VITE_API_BASE_URL belum diatur).'
      );
    }
    throw new Error(`Respons server tidak valid (${res.status}).`);
  }

  const data = parsedBody as {
    success?: boolean;
    message?: string;
  } & T;

  if (!res.ok || data.success === false) {
    if (Capacitor.isNativePlatform() && !RAW_BASE && res.status === 404) {
      throw new Error(
        'APK belum terhubung ke URL server backend. Atur variabel VITE_API_BASE_URL di GitHub untuk menyinkronkan akun & pesanan dengan MySQL sejati_maps.'
      );
    }
    throw new Error(data.message || `Permintaan gagal (${res.status})`);
  }
  return data;
}

export const api = {
  getCatalog: async () => {
    try {
      const res = await request<{ kategori: KategoriMenu[]; menu: MenuItem[]; warkop: Warkop[] }>('/catalog');
      if (
        !Array.isArray(res.kategori) ||
        !Array.isArray(res.menu) ||
        !Array.isArray(res.warkop)
      ) {
        throw new Error('Format data katalog tidak lengkap.');
      }
      return res;
    } catch (err) {
      if (Capacitor.isNativePlatform() && !RAW_BASE) {
        return getBundledCatalog();
      }
      throw err;
    }
  },

  validateGeo: async (lat: number, lng: number) => {
    try {
      const res = await request<GeoValidationResult>(
        `/geo/validate?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
      );
      if (typeof res.valid !== 'boolean') {
        throw new Error('Format hasil validasi wilayah tidak valid.');
      }
      return res;
    } catch (err) {
      if (Capacitor.isNativePlatform() && !RAW_BASE) {
        return validateGeoLocally(lat, lng);
      }
      throw err;
    }
  },

  registerCustomer: (payload: {
    nama: string;
    telepon: string;
    email?: string;
    alamat?: string;
    username: string;
    password: string;
  }) =>
    request<{ pelanggan: Pelanggan; token: string }>('/auth/customer/register', {
      method: 'POST',
      body: payload,
    }),

  loginCustomer: (payload: { identifier: string; password: string }) =>
    request<{ pelanggan: Pelanggan; token: string }>('/auth/customer/login', {
      method: 'POST',
      body: payload,
    }),

  checkoutOrder: (
    token: string,
    payload: {
      jenis_pesanan: JenisPesanan;
      metode_pembayaran: string;
      latitude: number;
      longitude: number;
      items: Array<{ menu_id: number; jumlah: number }>;
    }
  ) =>
    request<{ message: string; pesanan: Pesanan }>('/orders/checkout', {
      method: 'POST',
      body: payload,
      token,
    }),

  getMyOrders: (token: string) =>
    request<{ orders: Pesanan[] }>('/orders/my', { token }),

  getMyReservations: (token: string) =>
    request<{ reservations: Reservasi[] }>('/reservations/my', { token }),

  createReservation: (
    token: string,
    payload: { tanggal: string; jam: string; jumlah_orang: number; catatan?: string }
  ) =>
    request<{ reservation: Reservasi }>('/reservations', {
      method: 'POST',
      body: payload,
      token,
    }),

  getAdminStatus: () => request<{ has_admin: boolean }>('/auth/admin/status'),

  setupAdmin: (payload: { nama: string; username: string; password: string }) =>
    request<{ admin: AdminUser; token: string }>('/auth/admin/setup', {
      method: 'POST',
      body: payload,
    }),

  loginAdmin: (payload: { username: string; password: string }) =>
    request<{ admin: AdminUser; token: string }>('/auth/admin/login', {
      method: 'POST',
      body: payload,
    }),

  getAdminDashboard: (token: string) =>
    request<{ stats: DashboardStats }>('/admin/dashboard', { token }),

  createCategory: (token: string, nama_kategori: string) =>
    request<{ id: number }>('/admin/categories', {
      method: 'POST',
      body: { nama_kategori },
      token,
    }),

  updateCategory: (token: string, id: number, nama_kategori: string) =>
    request<void>('/admin/categories', {
      method: 'PUT',
      body: { id, nama_kategori },
      token,
    }),

  deleteCategory: (token: string, id: number) =>
    request<void>(`/admin/categories?id=${id}`, {
      method: 'DELETE',
      token,
    }),

  createMenu: (
    token: string,
    payload: {
      kategori_id: number | null;
      nama_menu: string;
      deskripsi: string;
      harga: number;
      foto: string;
      status: MenuStatus;
    }
  ) => request<{ id: number }>('/admin/menu', { method: 'POST', body: payload, token }),

  updateMenu: (
    token: string,
    payload: {
      id: number;
      kategori_id: number | null;
      nama_menu: string;
      deskripsi: string;
      harga: number;
      foto: string;
      status: MenuStatus;
    }
  ) => request<void>('/admin/menu', { method: 'PUT', body: payload, token }),

  deleteMenu: (token: string, id: number) =>
    request<void>(`/admin/menu?id=${id}`, { method: 'DELETE', token }),

  createWarkop: (
    token: string,
    payload: Omit<Warkop, 'id'>
  ) => request<{ id: number }>('/admin/warkop', { method: 'POST', body: payload, token }),

  updateWarkop: (token: string, payload: Warkop) =>
    request<void>('/admin/warkop', { method: 'PUT', body: payload, token }),

  deleteWarkop: (token: string, id: number) =>
    request<void>(`/admin/warkop?id=${id}`, { method: 'DELETE', token }),

  getAdminCustomers: (token: string) =>
    request<{ customers: Pelanggan[] }>('/admin/customers', { token }),

  updateAdminCustomer: (token: string, payload: Pelanggan) =>
    request<void>('/admin/customers', { method: 'PUT', body: payload, token }),

  deleteAdminCustomer: (token: string, id: number) =>
    request<void>(`/admin/customers?id=${id}`, { method: 'DELETE', token }),

  getAdminOrders: (token: string) =>
    request<{ orders: Pesanan[] }>('/admin/orders', { token }),

  updateOrderStatus: (token: string, id: number, status: StatusPesanan) =>
    request<void>('/admin/orders', { method: 'PUT', body: { id, status }, token }),

  getAdminPayments: (token: string) =>
    request<{
      payments: Array<Pembayaran & { kode_pesanan?: string; pelanggan_nama?: string }>;
    }>('/admin/payments', { token }),

  updatePaymentStatus: (token: string, id: number, status: StatusPembayaran) =>
    request<void>('/admin/payments', { method: 'PUT', body: { id, status }, token }),

  getAdminReservations: (token: string) =>
    request<{ reservations: Reservasi[] }>('/admin/reservations', { token }),

  updateReservationStatus: (token: string, id: number, status: StatusReservasi) =>
    request<void>('/admin/reservations', { method: 'PUT', body: { id, status }, token }),
};
