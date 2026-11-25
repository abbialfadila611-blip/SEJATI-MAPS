export interface KategoriMenu {
  id: number;
  nama_kategori: string;
}

export type MenuStatus = 'tersedia' | 'habis';

export interface MenuItem {
  id: number;
  kategori_id: number | null;
  nama_kategori?: string;
  nama_menu: string;
  deskripsi: string | null;
  harga: number;
  foto: string | null;
  status: MenuStatus;
}

export interface Warkop {
  id: number;
  nama: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  deskripsi: string | null;
  telepon: string | null;
}

export interface Pelanggan {
  id: number;
  nama: string;
  telepon: string;
  email: string | null;
  alamat: string | null;
  username?: string | null;
}

export interface AdminUser {
  id: number;
  nama: string;
  username: string;
}

export type JenisPesanan = 'dine_in' | 'takeaway';
export type StatusPesanan = 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan';
export type StatusPembayaran = 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'gagal';
export type StatusReservasi = 'menunggu' | 'dikonfirmasi' | 'ditolak' | 'selesai' | 'dibatalkan';

export interface DetailPesanan {
  id: number;
  pesanan_id: number;
  menu_id: number;
  nama_menu?: string;
  jumlah: number;
  harga: number;
  subtotal: number;
}

export interface Pembayaran {
  id: number;
  pesanan_id: number;
  metode: string | null;
  jumlah_bayar: number;
  status: StatusPembayaran;
  tanggal_bayar: string | null;
}

export interface Pesanan {
  id: number;
  pelanggan_id: number;
  pelanggan_nama?: string;
  pelanggan_telepon?: string;
  kode_pesanan: string;
  jenis_pesanan: JenisPesanan;
  total: number;
  status: StatusPesanan;
  tanggal_pesanan: string;
  items?: DetailPesanan[];
  pembayaran?: Pembayaran | null;
}

export interface Reservasi {
  id: number;
  pelanggan_id: number;
  pelanggan_nama?: string;
  pelanggan_telepon?: string;
  tanggal: string;
  jam: string;
  jumlah_orang: number;
  catatan: string | null;
  status: StatusReservasi;
}

export interface GeoValidationResult {
  valid: boolean;
  latitude: number;
  longitude: number;
  region: string;
  kecamatan_estimasi: string | null;
  message: string;
  nearest_warkop: {
    id: number;
    nama: string;
    distance_km: number;
  } | null;
}

export interface CartItem {
  menu: MenuItem;
  jumlah: number;
}

export interface DashboardStats {
  total_pesanan: number;
  pesanan_menunggu: number;
  pesanan_diproses: number;
  pesanan_selesai: number;
  total_pendapatan_lunas: number;
  total_menu: number;
  menu_tersedia: number;
  total_kategori: number;
  total_pelanggan: number;
  total_warkop: number;
  total_reservasi: number;
}
