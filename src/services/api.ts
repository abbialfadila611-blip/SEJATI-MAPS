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

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';
export const API_BASE = RAW_BASE ? RAW_BASE.replace(/\/+$/, '') : '/api';
export const IS_PHP_BACKEND = Boolean(RAW_BASE);

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

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
  } & T;

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Permintaan gagal (${res.status})`);
  }
  return data;
}

export const api = {
  getCatalog: () =>
    request<{ kategori: KategoriMenu[]; menu: MenuItem[]; warkop: Warkop[] }>('/catalog'),

  validateGeo: (lat: number, lng: number) =>
    request<GeoValidationResult>(`/geo/validate?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`),

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
