import {
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type {
  AdminUser,
  DashboardStats,
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
import { formatRupiah } from '../utils/geoPangkalPinang';
import { PangkalPinangMap } from './PangkalPinangMap';

type AdminTab =
  | 'dashboard'
  | 'pesanan'
  | 'pembayaran'
  | 'menu'
  | 'kategori'
  | 'warkop'
  | 'pelanggan'
  | 'reservasi';

interface AdminPanelViewProps {
  admin: AdminUser | null;
  adminToken: string | null;
  onAdminAuthenticated: (admin: AdminUser, token: string) => void;
  onAdminLogout: () => void;
  onOpenCustomerLogin?: () => void;
  kategoriList: KategoriMenu[];
  menuList: MenuItem[];
  warkopList: Warkop[];
  onRefreshCatalog: () => Promise<void>;
}

export function AdminPanelView({
  admin,
  adminToken,
  onAdminAuthenticated,
  onAdminLogout,
  onOpenCustomerLogin,
  kategoriList,
  menuList,
  warkopList,
  onRefreshCatalog,
}: AdminPanelViewProps) {
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [authNama, setAuthNama] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [payments, setPayments] = useState<
    Array<Pembayaran & { kode_pesanan?: string; pelanggan_nama?: string }>
  >([]);
  const [customers, setCustomers] = useState<Pelanggan[]>([]);
  const [reservations, setReservations] = useState<Reservasi[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form Kategori
  const [katEditId, setKatEditId] = useState<number | null>(null);
  const [katNama, setKatNama] = useState('');

  // Form Menu
  const [menuEditId, setMenuEditId] = useState<number | null>(null);
  const [menuKategoriId, setMenuKategoriId] = useState<string>('1');
  const [menuNama, setMenuNama] = useState('');
  const [menuDeskripsi, setMenuDeskripsi] = useState('');
  const [menuHarga, setMenuHarga] = useState('');
  const [menuFoto, setMenuFoto] = useState('');
  const [menuStatus, setMenuStatus] = useState<MenuStatus>('tersedia');

  // Form Warkop & Koordinat
  const [warkopEditId, setWarkopEditId] = useState<number | null>(null);
  const [warkopNama, setWarkopNama] = useState('');
  const [warkopAlamat, setWarkopAlamat] = useState('');
  const [warkopLat, setWarkopLat] = useState('-2.1301668');
  const [warkopLng, setWarkopLng] = useState('106.1125737');
  const [warkopDeskripsi, setWarkopDeskripsi] = useState('');
  const [warkopTelepon, setWarkopTelepon] = useState('');

  // Form Edit Pelanggan
  const [custEdit, setCustEdit] = useState<Pelanggan | null>(null);

  useEffect(() => {
    if (adminToken) return;
    api
      .getAdminStatus()
      .then((res) => setHasAdmin(res.has_admin))
      .catch(() => setHasAdmin(true));
  }, [adminToken]);

  const loadAdminData = useCallback(async () => {
    if (!adminToken) return;
    try {
      const [dashRes, ordRes, payRes, custRes, resRes] = await Promise.all([
        api.getAdminDashboard(adminToken),
        api.getAdminOrders(adminToken),
        api.getAdminPayments(adminToken),
        api.getAdminCustomers(adminToken),
        api.getAdminReservations(adminToken),
      ]);
      setStats(dashRes.stats);
      setOrders(ordRes.orders);
      setPayments(payRes.payments);
      setCustomers(custRes.customers);
      setReservations(resRes.reservations);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal memuat data admin.');
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      loadAdminData();
    }
  }, [adminToken, loadAdminData]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (hasAdmin === false) {
        const res = await api.setupAdmin({
          nama: authNama,
          username: authUsername,
          password: authPassword,
        });
        onAdminAuthenticated(res.admin, res.token);
      } else {
        const res = await api.loginAdmin({
          username: authUsername,
          password: authPassword,
        });
        onAdminAuthenticated(res.admin, res.token);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Autentikasi admin gagal.');
    } finally {
      setAuthBusy(false);
    }
  };

  const clearFeedback = () => {
    setActionNotice(null);
    setActionError(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    clearFeedback();
    try {
      if (katEditId) {
        await api.updateCategory(adminToken, katEditId, katNama);
        setActionNotice('Kategori menu berhasil diperbarui.');
      } else {
        await api.createCategory(adminToken, katNama);
        setActionNotice('Kategori menu baru berhasil ditambahkan.');
      }
      setKatEditId(null);
      setKatNama('');
      await onRefreshCatalog();
      await loadAdminData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan kategori.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!adminToken) return;
    clearFeedback();
    try {
      await api.deleteCategory(adminToken, id);
      setActionNotice('Kategori berhasil dihapus.');
      await onRefreshCatalog();
      await loadAdminData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menghapus kategori.');
    }
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    clearFeedback();
    try {
      const payload = {
        kategori_id: menuKategoriId ? Number(menuKategoriId) : null,
        nama_menu: menuNama,
        deskripsi: menuDeskripsi,
        harga: Number(menuHarga),
        foto: menuFoto,
        status: menuStatus,
      };
      if (menuEditId) {
        await api.updateMenu(adminToken, { id: menuEditId, ...payload });
        setActionNotice('Data menu berhasil diperbarui.');
      } else {
        await api.createMenu(adminToken, payload);
        setActionNotice('Menu baru berhasil ditambahkan.');
      }
      setMenuEditId(null);
      setMenuNama('');
      setMenuDeskripsi('');
      setMenuHarga('');
      setMenuFoto('');
      setMenuStatus('tersedia');
      await onRefreshCatalog();
      await loadAdminData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan menu.');
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!adminToken) return;
    clearFeedback();
    try {
      await api.deleteMenu(adminToken, id);
      setActionNotice('Menu berhasil dihapus.');
      await onRefreshCatalog();
      await loadAdminData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menghapus menu.');
    }
  };

  const handleSaveWarkop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    clearFeedback();
    try {
      const payload = {
        nama: warkopNama,
        alamat: warkopAlamat || null,
        latitude: warkopLat ? Number(warkopLat) : null,
        longitude: warkopLng ? Number(warkopLng) : null,
        deskripsi: warkopDeskripsi || null,
        telepon: warkopTelepon || null,
      };
      if (warkopEditId) {
        await api.updateWarkop(adminToken, { id: warkopEditId, ...payload });
        setActionNotice('Lokasi & data usaha kuliner berhasil diperbarui.');
      } else {
        await api.createWarkop(adminToken, payload);
        setActionNotice('Usaha kuliner baru berhasil ditambahkan.');
      }
      setWarkopEditId(null);
      setWarkopNama('');
      setWarkopAlamat('');
      setWarkopDeskripsi('');
      setWarkopTelepon('');
      await onRefreshCatalog();
      await loadAdminData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan usaha kuliner.');
    }
  };

  if (!admin || !adminToken) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[#E6E4DF] bg-white p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            {hasAdmin === false ? 'Buat Akun Admin Pertama' : 'Login Administrator'}
          </h1>
          <p className="mt-1 text-sm text-[#57534E]">
            {hasAdmin === false
              ? 'Tabel admin saat ini masih kosong. Daftarkan akun administrator utama untuk mengelola sistem.'
              : 'Masuk untuk mengelola kategori, menu, usaha kuliner, koordinat peta, pesanan, dan pembayaran.'}
          </p>

          {onOpenCustomerLogin && (
            <div className="mt-4">
              <span className="block text-[11px] font-semibold tracking-wide text-[#78716C] uppercase">
                Pilih Jenis Akun Login
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onOpenCustomerLogin}
                  className="flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-xl border border-[#E6E4DF] bg-[#FAFAF8] px-3 py-2 text-left text-[#57534E] transition-colors hover:bg-[#F3F1EC]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E6E4DF] bg-white text-[#57534E]">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">Pelanggan</p>
                    <p className="truncate text-[10px] opacity-80">Pesan &amp; reservasi</p>
                  </div>
                </button>

                <div className="flex min-h-[46px] items-center gap-2.5 rounded-xl border border-[#14532D] bg-[#14532D]/8 px-3 py-2 text-left text-[#14532D]">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#14532D] text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">Admin</p>
                    <p className="truncate text-[10px] opacity-80">Kelola sistem</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminAuth} autoComplete="on" className="mt-5 space-y-3.5">
            {hasAdmin === false && (
              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Nama Lengkap Admin
                </label>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={authNama}
                  onChange={(e) => setAuthNama(e.target.value)}
                  placeholder="Pengelola Warkop Sejati"
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-[#E6E4DF] px-3.5 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#57534E]">
                Username
              </label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Masukkan username admin"
                className="mt-1 min-h-[42px] w-full rounded-lg border border-[#E6E4DF] px-3.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#57534E]">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  name="password"
                  autoComplete={hasAdmin === false ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="min-h-[42px] w-full rounded-lg border border-[#E6E4DF] pr-11 pl-3.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass((v) => !v)}
                  className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[#78716C] hover:text-[#1C1917]"
                  aria-label={showAdminPass ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showAdminPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C]">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authBusy}
              className="min-h-[44px] w-full cursor-pointer rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166534]"
            >
              {authBusy
                ? 'Memproses...'
                : hasAdmin === false
                ? 'Simpan & Masuk Panel Admin'
                : 'Masuk Panel Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pesanan', label: 'Pesanan' },
    { id: 'pembayaran', label: 'Pembayaran' },
    { id: 'menu', label: 'Menu' },
    { id: 'kategori', label: 'Kategori' },
    { id: 'warkop', label: 'Usaha & Lokasi' },
    { id: 'pelanggan', label: 'Pelanggan' },
    { id: 'reservasi', label: 'Reservasi' },
  ];

  const pickedLatNum = Number(warkopLat);
  const pickedLngNum = Number(warkopLng);
  const validPicked = Number.isFinite(pickedLatNum) && Number.isFinite(pickedLngNum);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6E4DF] pb-5">
        <div>
          <p className="text-xs text-[#78716C]">
            Panel Administrator · {admin.nama} ({admin.username})
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-[#1C1917] sm:text-3xl">
            Manajemen SEJATI MAPS
          </h1>
        </div>

        <button
          type="button"
          onClick={onAdminLogout}
          className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-[#E6E4DF] bg-white px-4 py-2 text-xs font-semibold text-[#57534E] hover:text-[#B91C1C]"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar Admin</span>
        </button>
      </div>

      {/* Tab Navigasi Admin */}
      <div className="mt-5 flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#F3F1EC] p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              clearFeedback();
              setActiveTab(t.id);
            }}
            className={`min-h-[38px] cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === t.id
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionNotice && (
        <div className="mt-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-xs font-medium text-[#14532D]">
          {actionNotice}
        </div>
      )}
      {actionError && (
        <div className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs font-medium text-[#B91C1C]">
          {actionError}
        </div>
      )}

      {/* 1. DASHBOARD STATISTIK */}
      {activeTab === 'dashboard' && stats && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E6E4DF] bg-white p-5">
              <p className="text-xs text-[#78716C]">Pendapatan Lunas</p>
              <p className="font-mono tabular-nums mt-1.5 text-2xl font-bold text-[#14532D]">
                {formatRupiah(stats.total_pendapatan_lunas)}
              </p>
            </div>
            <div className="rounded-xl border border-[#E6E4DF] bg-white p-5">
              <p className="text-xs text-[#78716C]">Total Pesanan</p>
              <p className="font-mono tabular-nums mt-1.5 text-2xl font-bold text-[#1C1917]">
                {stats.total_pesanan}
              </p>
              <p className="mt-1 text-xs text-[#57534E]">
                Menunggu: {stats.pesanan_menunggu} · Diproses: {stats.pesanan_diproses}
              </p>
            </div>
            <div className="rounded-xl border border-[#E6E4DF] bg-white p-5">
              <p className="text-xs text-[#78716C]">Menu &amp; Kategori</p>
              <p className="font-mono tabular-nums mt-1.5 text-2xl font-bold text-[#1C1917]">
                {stats.menu_tersedia} / {stats.total_menu}
              </p>
              <p className="mt-1 text-xs text-[#57534E]">
                {stats.total_kategori} kategori aktif
              </p>
            </div>
            <div className="rounded-xl border border-[#E6E4DF] bg-white p-5">
              <p className="text-xs text-[#78716C]">Pelanggan &amp; Reservasi</p>
              <p className="font-mono tabular-nums mt-1.5 text-2xl font-bold text-[#1C1917]">
                {stats.total_pelanggan}
              </p>
              <p className="mt-1 text-xs text-[#57534E]">
                {stats.total_reservasi} reservasi · {stats.total_warkop} outlet
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E6E4DF] bg-white p-5">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-[#14532D]" />
              <h2 className="text-sm font-semibold text-[#1C1917]">
                Pesanan Terbaru
              </h2>
            </div>
            {orders.length === 0 ? (
              <p className="mt-4 text-sm text-[#57534E]">
                Belum ada transaksi pesanan masuk.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#E6E4DF] text-xs text-[#78716C]">
                    <tr>
                      <th className="py-2 pr-4">Kode</th>
                      <th className="py-2 pr-4">Pelanggan</th>
                      <th className="py-2 pr-4">Jenis</th>
                      <th className="py-2 pr-4 text-right">Total</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E4DF]">
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.id} className="h-10">
                        <td className="font-mono py-2 pr-4 text-xs font-semibold">
                          {o.kode_pesanan}
                        </td>
                        <td className="py-2 pr-4">{o.pelanggan_nama ?? '-'}</td>
                        <td className="py-2 pr-4 text-xs text-[#57534E]">
                          {o.jenis_pesanan}
                        </td>
                        <td className="font-mono tabular-nums py-2 pr-4 text-right">
                          {formatRupiah(o.total)}
                        </td>
                        <td className="py-2 text-xs font-semibold text-[#14532D]">
                          {o.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. KELOLA PESANAN */}
      {activeTab === 'pesanan' && (
        <div className="mt-6 rounded-xl border border-[#E6E4DF] bg-white p-5">
          <h2 className="text-base font-semibold text-[#1C1917]">
            Daftar Pesanan ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-[#57534E]">Belum ada pesanan.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-xl border border-[#E6E4DF] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-[#1C1917]">
                        {o.kode_pesanan}
                      </span>
                      <span className="mx-2 text-[#A8A29E]">·</span>
                      <span className="text-sm font-medium text-[#1C1917]">
                        {o.pelanggan_nama} ({o.pelanggan_telepon})
                      </span>
                      <span className="mx-2 text-[#A8A29E]">·</span>
                      <span className="font-mono tabular-nums text-sm font-semibold text-[#14532D]">
                        {formatRupiah(o.total)}
                      </span>
                    </div>

                    <select
                      value={o.status}
                      onChange={async (e) => {
                        clearFeedback();
                        try {
                          await api.updateOrderStatus(
                            adminToken,
                            o.id,
                            e.target.value as StatusPesanan
                          );
                          setActionNotice(`Status pesanan ${o.kode_pesanan} diperbarui.`);
                          await loadAdminData();
                        } catch (err) {
                          setActionError(
                            err instanceof Error ? err.message : 'Gagal mengubah status.'
                          );
                        }
                      }}
                      className="min-h-[38px] rounded-lg border border-[#E6E4DF] bg-white px-3 text-xs font-semibold"
                    >
                      <option value="menunggu">Menunggu</option>
                      <option value="diproses">Diproses</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </div>

                  <div className="mt-2.5 text-xs text-[#57534E]">
                    Item:{' '}
                    {o.items
                      ?.map((it) => `${it.nama_menu ?? `#${it.menu_id}`} (${it.jumlah})`)
                      .join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. KELOLA PEMBAYARAN */}
      {activeTab === 'pembayaran' && (
        <div className="mt-6 rounded-xl border border-[#E6E4DF] bg-white p-5">
          <h2 className="text-base font-semibold text-[#1C1917]">
            Kelola Pembayaran ({payments.length})
          </h2>
          {payments.length === 0 ? (
            <p className="mt-3 text-sm text-[#57534E]">Belum ada data pembayaran.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E6E4DF] text-xs text-[#78716C]">
                  <tr>
                    <th className="py-2 pr-4">Kode Pesanan</th>
                    <th className="py-2 pr-4">Pelanggan</th>
                    <th className="py-2 pr-4">Metode</th>
                    <th className="py-2 pr-4 text-right">Jumlah</th>
                    <th className="py-2">Status Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DF]">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="font-mono py-3 pr-4 text-xs font-semibold">
                        {p.kode_pesanan ?? `#${p.pesanan_id}`}
                      </td>
                      <td className="py-3 pr-4">{p.pelanggan_nama ?? '-'}</td>
                      <td className="py-3 pr-4 text-xs">{p.metode ?? '-'}</td>
                      <td className="font-mono tabular-nums py-3 pr-4 text-right">
                        {formatRupiah(p.jumlah_bayar)}
                      </td>
                      <td className="py-3">
                        <select
                          value={p.status}
                          onChange={async (e) => {
                            clearFeedback();
                            try {
                              await api.updatePaymentStatus(
                                adminToken,
                                p.id,
                                e.target.value as StatusPembayaran
                              );
                              setActionNotice('Status pembayaran diperbarui.');
                              await loadAdminData();
                            } catch (err) {
                              setActionError(
                                err instanceof Error
                                  ? err.message
                                  : 'Gagal memperbarui pembayaran.'
                              );
                            }
                          }}
                          className="min-h-[36px] rounded-lg border border-[#E6E4DF] bg-white px-2.5 text-xs font-semibold"
                        >
                          <option value="belum_bayar">Belum Bayar</option>
                          <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                          <option value="lunas">Lunas</option>
                          <option value="gagal">Gagal</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. KELOLA MENU */}
      {activeTab === 'menu' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSaveMenu}
            className="rounded-xl border border-[#E6E4DF] bg-white p-5 lg:col-span-4"
          >
            <h2 className="text-base font-semibold text-[#1C1917]">
              {menuEditId ? 'Edit Menu' : 'Tambah Menu Baru'}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Kategori
                </label>
                <select
                  value={menuKategoriId}
                  onChange={(e) => setMenuKategoriId(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                >
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Nama Menu
                </label>
                <input
                  type="text"
                  required
                  value={menuNama}
                  onChange={(e) => setMenuNama(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  min={500}
                  required
                  value={menuHarga}
                  onChange={(e) => setMenuHarga(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Status
                </label>
                <select
                  value={menuStatus}
                  onChange={(e) => setMenuStatus(e.target.value as MenuStatus)}
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                >
                  <option value="tersedia">Tersedia</option>
                  <option value="habis">Habis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  URL / Path Foto (Opsional)
                </label>
                <input
                  type="text"
                  value={menuFoto}
                  onChange={(e) => setMenuFoto(e.target.value)}
                  placeholder="/assets/menu/kopi.jpg"
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  value={menuDeskripsi}
                  onChange={(e) => setMenuDeskripsi(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E6E4DF] p-3 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-[42px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
                >
                  <Plus className="h-4 w-4" />
                  <span>{menuEditId ? 'Simpan Perubahan' : 'Tambah Menu'}</span>
                </button>
                {menuEditId && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuEditId(null);
                      setMenuNama('');
                      setMenuDeskripsi('');
                      setMenuHarga('');
                      setMenuFoto('');
                    }}
                    className="min-h-[42px] cursor-pointer rounded-lg border border-[#E6E4DF] px-3 text-xs font-medium"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="rounded-xl border border-[#E6E4DF] bg-white p-5 lg:col-span-8">
            <h2 className="text-base font-semibold text-[#1C1917]">
              Daftar Menu ({menuList.length})
            </h2>
            <div className="mt-4 max-h-[580px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b border-[#E6E4DF] bg-white text-xs text-[#78716C]">
                  <tr>
                    <th className="py-2 pr-3">Nama Menu</th>
                    <th className="py-2 pr-3">Kategori</th>
                    <th className="py-2 pr-3 text-right">Harga</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DF]">
                  {menuList.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2.5 pr-3 font-medium text-[#1C1917]">
                        {m.nama_menu}
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-[#57534E]">
                        {m.nama_kategori ?? '-'}
                      </td>
                      <td className="font-mono tabular-nums py-2.5 pr-3 text-right">
                        {formatRupiah(m.harga)}
                      </td>
                      <td className="py-2.5 pr-3 text-xs font-semibold">
                        <span
                          className={
                            m.status === 'tersedia' ? 'text-[#14532D]' : 'text-[#B91C1C]'
                          }
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setMenuEditId(m.id);
                              setMenuKategoriId(String(m.kategori_id ?? ''));
                              setMenuNama(m.nama_menu);
                              setMenuDeskripsi(m.deskripsi ?? '');
                              setMenuHarga(String(m.harga));
                              setMenuFoto(m.foto ?? '');
                              setMenuStatus(m.status);
                            }}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#57534E] hover:bg-[#F3F1EC]"
                            aria-label={`Edit ${m.nama_menu}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMenu(m.id)}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                            aria-label={`Hapus ${m.nama_menu}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. KELOLA DELAPAN KATEGORI */}
      {activeTab === 'kategori' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSaveCategory}
            className="rounded-xl border border-[#E6E4DF] bg-white p-5 lg:col-span-4"
          >
            <h2 className="text-base font-semibold text-[#1C1917]">
              {katEditId ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                required
                value={katNama}
                onChange={(e) => setKatNama(e.target.value)}
                placeholder="Nama kategori menu"
                className="min-h-[42px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="min-h-[42px] flex-1 cursor-pointer rounded-lg bg-[#14532D] px-4 text-xs font-semibold text-white hover:bg-[#166534]"
                >
                  {katEditId ? 'Simpan Kategori' : 'Tambah Kategori'}
                </button>
                {katEditId && (
                  <button
                    type="button"
                    onClick={() => {
                      setKatEditId(null);
                      setKatNama('');
                    }}
                    className="min-h-[42px] cursor-pointer rounded-lg border border-[#E6E4DF] px-3 text-xs"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="rounded-xl border border-[#E6E4DF] bg-white p-5 lg:col-span-8">
            <h2 className="text-base font-semibold text-[#1C1917]">
              Daftar Kategori ({kategoriList.length})
            </h2>
            <div className="mt-4 divide-y divide-[#E6E4DF]">
              {kategoriList.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <span className="font-mono text-xs text-[#78716C] mr-3">
                      #{k.id}
                    </span>
                    <span className="font-semibold text-[#1C1917]">
                      {k.nama_kategori}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setKatEditId(k.id);
                        setKatNama(k.nama_kategori);
                      }}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#57534E] hover:bg-[#F3F1EC]"
                      aria-label={`Edit ${k.nama_kategori}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(k.id)}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                      aria-label={`Hapus ${k.nama_kategori}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. KELOLA USAHA KULINER & KOORDINAT PETA */}
      {activeTab === 'warkop' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <form
              onSubmit={handleSaveWarkop}
              className="rounded-xl border border-[#E6E4DF] bg-white p-5"
            >
              <h2 className="text-base font-semibold text-[#1C1917]">
                {warkopEditId ? 'Edit Usaha & Koordinat' : 'Tambah Usaha Kuliner'}
              </h2>
              <p className="mt-1 text-xs text-[#57534E]">
                Klik langsung pada peta di samping untuk mengisi latitude &amp; longitude otomatis.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  required
                  value={warkopNama}
                  onChange={(e) => setWarkopNama(e.target.value)}
                  placeholder="Nama usaha kuliner"
                  className="min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                />
                <textarea
                  rows={2}
                  value={warkopAlamat}
                  onChange={(e) => setWarkopAlamat(e.target.value)}
                  placeholder="Alamat lengkap"
                  className="w-full rounded-lg border border-[#E6E4DF] p-3 text-sm"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-[#78716C]">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={warkopLat}
                      onChange={(e) => setWarkopLat(e.target.value)}
                      className="font-mono mt-1 min-h-[38px] w-full rounded-lg border border-[#E6E4DF] px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#78716C]">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={warkopLng}
                      onChange={(e) => setWarkopLng(e.target.value)}
                      className="font-mono mt-1 min-h-[38px] w-full rounded-lg border border-[#E6E4DF] px-3 text-xs"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={warkopTelepon}
                  onChange={(e) => setWarkopTelepon(e.target.value)}
                  placeholder="Nomor telepon"
                  className="min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                />
                <textarea
                  rows={2}
                  value={warkopDeskripsi}
                  onChange={(e) => setWarkopDeskripsi(e.target.value)}
                  placeholder="Deskripsi usaha"
                  className="w-full rounded-lg border border-[#E6E4DF] p-3 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="min-h-[42px] flex-1 cursor-pointer rounded-lg bg-[#14532D] px-4 text-xs font-semibold text-white hover:bg-[#166534]"
                  >
                    {warkopEditId ? 'Simpan Perubahan' : 'Simpan Usaha'}
                  </button>
                  {warkopEditId && (
                    <button
                      type="button"
                      onClick={() => {
                        setWarkopEditId(null);
                        setWarkopNama('');
                        setWarkopAlamat('');
                        setWarkopDeskripsi('');
                        setWarkopTelepon('');
                      }}
                      className="min-h-[42px] cursor-pointer rounded-lg border border-[#E6E4DF] px-3 text-xs"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="rounded-xl border border-[#E6E4DF] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#1C1917]">
                Daftar Usaha Kuliner ({warkopList.length})
              </h3>
              <div className="mt-3 divide-y divide-[#E6E4DF]">
                {warkopList.map((w) => (
                  <div key={w.id} className="py-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#1C1917]">{w.nama}</p>
                        <p className="mt-0.5 text-[#57534E]">{w.alamat}</p>
                        <p className="font-mono mt-1 text-[#78716C]">
                          {w.latitude}, {w.longitude}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setWarkopEditId(w.id);
                            setWarkopNama(w.nama);
                            setWarkopAlamat(w.alamat ?? '');
                            setWarkopLat(w.latitude != null ? String(w.latitude) : '');
                            setWarkopLng(w.longitude != null ? String(w.longitude) : '');
                            setWarkopDeskripsi(w.deskripsi ?? '');
                            setWarkopTelepon(w.telepon ?? '');
                          }}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#57534E] hover:bg-[#F3F1EC]"
                          aria-label={`Edit ${w.nama}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            clearFeedback();
                            await api.deleteWarkop(adminToken, w.id);
                            setActionNotice('Usaha kuliner dihapus.');
                            await onRefreshCatalog();
                            await loadAdminData();
                          }}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                          aria-label={`Hapus ${w.nama}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-[#E6E4DF] bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#57534E]">
                <MapPin className="h-4 w-4 text-[#B45309]" />
                <span>Mode Pilih Koordinat Aktif — klik peta untuk menentukan titik lokasi</span>
              </div>
              <PangkalPinangMap
                warkopList={warkopList}
                pickMode={true}
                pickedCoordinate={
                  validPicked
                    ? { latitude: pickedLatNum, longitude: pickedLngNum }
                    : null
                }
                onSelectPoint={(lat, lng) => {
                  setWarkopLat(String(lat));
                  setWarkopLng(String(lng));
                }}
                heightClass="h-[480px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. KELOLA PELANGGAN */}
      {activeTab === 'pelanggan' && (
        <div className="mt-6 rounded-xl border border-[#E6E4DF] bg-white p-5">
          <h2 className="text-base font-semibold text-[#1C1917]">
            Daftar Pelanggan ({customers.length})
          </h2>

          {custEdit && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                clearFeedback();
                try {
                  await api.updateAdminCustomer(adminToken, custEdit);
                  setActionNotice('Data pelanggan diperbarui.');
                  setCustEdit(null);
                  await loadAdminData();
                } catch (err) {
                  setActionError(
                    err instanceof Error ? err.message : 'Gagal memperbarui pelanggan.'
                  );
                }
              }}
              className="mt-4 grid gap-3 rounded-xl border border-[#E6E4DF] bg-[#FAFAF8] p-4 sm:grid-cols-4"
            >
              <input
                type="text"
                required
                value={custEdit.nama}
                onChange={(e) => setCustEdit({ ...custEdit, nama: e.target.value })}
                placeholder="Nama"
                className="min-h-[38px] rounded-lg border border-[#E6E4DF] bg-white px-3 text-sm"
              />
              <input
                type="text"
                required
                value={custEdit.telepon}
                onChange={(e) => setCustEdit({ ...custEdit, telepon: e.target.value })}
                placeholder="Telepon"
                className="min-h-[38px] rounded-lg border border-[#E6E4DF] bg-white px-3 text-sm"
              />
              <input
                type="text"
                value={custEdit.alamat ?? ''}
                onChange={(e) => setCustEdit({ ...custEdit, alamat: e.target.value })}
                placeholder="Alamat"
                className="min-h-[38px] rounded-lg border border-[#E6E4DF] bg-white px-3 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="min-h-[38px] flex-1 cursor-pointer rounded-lg bg-[#14532D] px-3 text-xs font-semibold text-white"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setCustEdit(null)}
                  className="min-h-[38px] cursor-pointer rounded-lg border border-[#E6E4DF] bg-white px-3 text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {customers.length === 0 ? (
            <p className="mt-3 text-sm text-[#57534E]">Belum ada pelanggan terdaftar.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E6E4DF] text-xs text-[#78716C]">
                  <tr>
                    <th className="py-2 pr-4">Nama</th>
                    <th className="py-2 pr-4">Telepon</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Alamat</th>
                    <th className="py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DF]">
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 pr-4 font-medium">{c.nama}</td>
                      <td className="font-mono py-2.5 pr-4 text-xs">{c.telepon}</td>
                      <td className="py-2.5 pr-4 text-xs text-[#57534E]">
                        {c.email ?? '-'}
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-[#57534E]">
                        {c.alamat ?? '-'}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() => setCustEdit(c)}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#57534E] hover:bg-[#F3F1EC]"
                            aria-label={`Edit ${c.nama}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              clearFeedback();
                              try {
                                await api.deleteAdminCustomer(adminToken, c.id);
                                setActionNotice('Pelanggan dihapus.');
                                await loadAdminData();
                              } catch (err) {
                                setActionError(
                                  err instanceof Error
                                    ? err.message
                                    : 'Gagal menghapus pelanggan.'
                                );
                              }
                            }}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                            aria-label={`Hapus ${c.nama}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 8. KELOLA RESERVASI */}
      {activeTab === 'reservasi' && (
        <div className="mt-6 rounded-xl border border-[#E6E4DF] bg-white p-5">
          <h2 className="text-base font-semibold text-[#1C1917]">
            Kelola Reservasi Meja ({reservations.length})
          </h2>
          {reservations.length === 0 ? (
            <p className="mt-3 text-sm text-[#57534E]">Belum ada data reservasi.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E6E4DF] text-xs text-[#78716C]">
                  <tr>
                    <th className="py-2 pr-4">Pelanggan</th>
                    <th className="py-2 pr-4">Jadwal</th>
                    <th className="py-2 pr-4">Jumlah Tamu</th>
                    <th className="py-2 pr-4">Catatan</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DF]">
                  {reservations.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{r.pelanggan_nama ?? '-'}</div>
                        <div className="font-mono text-xs text-[#78716C]">
                          {r.pelanggan_telepon}
                        </div>
                      </td>
                      <td className="font-mono py-3 pr-4 text-xs">
                        {r.tanggal} · {r.jam}
                      </td>
                      <td className="font-mono tabular-nums py-3 pr-4">
                        {r.jumlah_orang} orang
                      </td>
                      <td className="py-3 pr-4 text-xs text-[#57534E]">
                        {r.catatan ?? '-'}
                      </td>
                      <td className="py-3">
                        <select
                          value={r.status}
                          onChange={async (e) => {
                            clearFeedback();
                            try {
                              await api.updateReservationStatus(
                                adminToken,
                                r.id,
                                e.target.value as StatusReservasi
                              );
                              setActionNotice('Status reservasi diperbarui.');
                              await loadAdminData();
                            } catch (err) {
                              setActionError(
                                err instanceof Error
                                  ? err.message
                                  : 'Gagal memperbarui reservasi.'
                              );
                            }
                          }}
                          className="min-h-[36px] rounded-lg border border-[#E6E4DF] bg-white px-2.5 text-xs font-semibold"
                        >
                          <option value="menunggu">Menunggu</option>
                          <option value="dikonfirmasi">Dikonfirmasi</option>
                          <option value="ditolak">Ditolak</option>
                          <option value="selesai">Selesai</option>
                          <option value="dibatalkan">Dibatalkan</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
