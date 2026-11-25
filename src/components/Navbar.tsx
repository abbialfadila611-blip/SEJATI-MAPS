import {
  CalendarClock,
  ChevronRight,
  History,
  Home,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AdminUser, Pelanggan } from '../types';

export type AppRoute = 'beranda' | 'katalog' | 'peta' | 'reservasi' | 'riwayat' | 'admin';

interface NavbarProps {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
  onOpenCart: () => void;
  customer: Pelanggan | null;
  onOpenCustomerAuth: () => void;
  onCustomerLogout: () => void;
  admin: AdminUser | null;
}

const ROUTE_LABELS: Record<AppRoute, string> = {
  beranda: 'Beranda',
  katalog: 'Katalog Menu',
  peta: 'Peta GIS & Lokasi',
  reservasi: 'Reservasi Meja',
  riwayat: 'Riwayat Pesanan',
  admin: 'Panel Admin',
};

export function Navbar({
  activeRoute,
  onNavigate,
  cartCount,
  onOpenCart,
  customer,
  onOpenCustomerAuth,
  onCustomerLogout,
  admin,
}: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const handleNav = (route: AppRoute) => {
    onNavigate(route);
    setDrawerOpen(false);
  };

  const handleOpenCartFromDrawer = () => {
    setDrawerOpen(false);
    onOpenCart();
  };

  const handleOpenAuthFromDrawer = () => {
    setDrawerOpen(false);
    onOpenCustomerAuth();
  };

  const primaryPages: Array<{
    id: AppRoute;
    label: string;
    subtitle: string;
    Icon: typeof Home;
  }> = [
    {
      id: 'beranda',
      label: 'Beranda',
      subtitle: 'Ringkasan layanan & lokasi',
      Icon: Home,
    },
    {
      id: 'katalog',
      label: 'Katalog Menu',
      subtitle: '8 kategori makanan & minuman',
      Icon: UtensilsCrossed,
    },
    {
      id: 'peta',
      label: 'Peta GIS Pangkal Pinang',
      subtitle: 'Peta usaha & deteksi GPS',
      Icon: MapPin,
    },
  ];

  const servicePages: Array<{
    id: AppRoute;
    label: string;
    subtitle: string;
    Icon: typeof History;
  }> = [
    {
      id: 'reservasi',
      label: 'Reservasi Meja',
      subtitle: 'Pesan meja di Warkop Sejati',
      Icon: CalendarClock,
    },
    {
      id: 'riwayat',
      label: 'Riwayat Pesanan',
      subtitle: 'Pantau pesanan & pembayaran',
      Icon: History,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E6E4DF] bg-[#FAFAF8]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Kiri: Tombol Garis 3 (Semua Perangkat) + Identitas & Halaman Aktif */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={drawerOpen}
              aria-controls="sejati-drawer-nav"
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#E6E4DF] bg-white text-[#1C1917] transition-colors hover:border-[#14532D]/40 hover:bg-[#F3F1EC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => handleNav('beranda')}
              className="font-display cursor-pointer truncate text-lg font-bold tracking-tight text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14532D]"
            >
              SEJATI MAPS
            </button>

            <span className="hidden text-[#D6D3CD] sm:inline">/</span>
            <span className="hidden truncate text-sm font-medium text-[#57534E] sm:inline">
              {ROUTE_LABELS[activeRoute]}
            </span>
          </div>

          {/* Kanan: Aksi Keranjang */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#166534] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Keranjang</span>
              {cartCount > 0 && (
                <span className="font-mono tabular-nums text-xs font-semibold">
                  ({cartCount})
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Navigasi Garis 3 (Mobile, Tablet, & Laptop/Desktop) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi SEJATI MAPS"
        >
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <aside
            id="sejati-drawer-nav"
            className="relative z-10 flex h-full w-80 max-w-[86vw] flex-col border-r border-[#E6E4DF] bg-[#FAFAF8] shadow-2xl"
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-[#E6E4DF] bg-white px-5 py-4">
              <div>
                <p className="font-display text-lg font-bold tracking-tight text-[#1C1917]">
                  SEJATI MAPS
                </p>
                <p className="text-xs text-[#78716C]">
                  Kuliner &amp; GIS Pangkal Pinang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu navigasi"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] text-[#1C1917] transition-colors hover:bg-[#F3F1EC]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Daftar Halaman */}
            <nav
              aria-label="Daftar halaman aplikasi"
              className="flex-1 space-y-6 overflow-y-auto px-4 py-5"
            >
              {/* Kelompok 1: Jelajah */}
              <div>
                <p className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-[#78716C] uppercase">
                  Jelajah Kuliner
                </p>
                <div className="space-y-1">
                  {primaryPages.map(({ id, label, subtitle, Icon }) => {
                    const isActive = activeRoute === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleNav(id)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? 'border border-[#14532D]/20 bg-[#14532D]/8 text-[#14532D]'
                            : 'border border-transparent text-[#1C1917] hover:bg-[#F3F1EC]'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isActive
                                ? 'bg-[#14532D] text-white'
                                : 'border border-[#E6E4DF] bg-white text-[#57534E]'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {label}
                            </p>
                            <p className="truncate text-xs text-[#78716C]">
                              {subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? 'text-[#14532D]' : 'text-[#A8A29E]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kelompok 2: Pemesanan & Riwayat */}
              <div>
                <p className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-[#78716C] uppercase">
                  Pemesanan &amp; Layanan
                </p>
                <div className="space-y-1">
                  {servicePages.map(({ id, label, subtitle, Icon }) => {
                    const isActive = activeRoute === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleNav(id)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? 'border border-[#14532D]/20 bg-[#14532D]/8 text-[#14532D]'
                            : 'border border-transparent text-[#1C1917] hover:bg-[#F3F1EC]'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isActive
                                ? 'bg-[#14532D] text-white'
                                : 'border border-[#E6E4DF] bg-white text-[#57534E]'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {label}
                            </p>
                            <p className="truncate text-xs text-[#78716C]">
                              {subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? 'text-[#14532D]' : 'text-[#A8A29E]'
                          }`}
                        />
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleOpenCartFromDrawer}
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-left text-[#1C1917] transition-colors hover:bg-[#F3F1EC]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E6E4DF] bg-white text-[#57534E]">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          Keranjang &amp; Checkout
                        </p>
                        <p className="truncate text-xs text-[#78716C]">
                          {cartCount > 0
                            ? `${cartCount} item siap dipesan`
                            : 'Belum ada item dipilih'}
                        </p>
                      </div>
                    </div>
                    {cartCount > 0 ? (
                      <span className="font-mono rounded-md bg-[#14532D] px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                        {cartCount}
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#A8A29E]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Kelompok 3: Akun Pelanggan & Panel Admin */}
              <div>
                <p className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-[#78716C] uppercase">
                  Akun &amp; Pengelola
                </p>
                <div className="space-y-2">
                  {customer ? (
                    <div className="rounded-xl border border-[#E6E4DF] bg-white p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14532D]/10 text-[#14532D]">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#1C1917]">
                            {customer.nama}
                          </p>
                          <p className="truncate text-xs text-[#78716C]">
                            {customer.username ? `@${customer.username}` : customer.telepon}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onCustomerLogout();
                          setDrawerOpen(false);
                        }}
                        className="mt-3 flex min-h-[38px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] px-3 text-xs font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Keluar Akun Pelanggan</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenAuthFromDrawer}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#E6E4DF] bg-white px-3 py-2.5 text-left text-[#1C1917] transition-colors hover:border-[#14532D]/40 hover:bg-[#F3F1EC]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14532D]/10 text-[#14532D]">
                          <LogIn className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            Daftar / Login Akun
                          </p>
                          <p className="truncate text-xs text-[#78716C]">
                            Pilih akun Pelanggan atau Admin
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#A8A29E]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleNav('admin')}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      activeRoute === 'admin'
                        ? 'border border-[#14532D]/20 bg-[#14532D]/8 text-[#14532D]'
                        : 'border border-transparent text-[#1C1917] hover:bg-[#F3F1EC]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          activeRoute === 'admin'
                            ? 'bg-[#14532D] text-white'
                            : 'border border-[#E6E4DF] bg-white text-[#57534E]'
                        }`}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          Halaman Admin
                        </p>
                        <p className="truncate text-xs text-[#78716C]">
                          {admin
                            ? `Aktif sebagai ${admin.username}`
                            : 'Kelola menu, pesanan & GIS'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${
                        activeRoute === 'admin'
                          ? 'text-[#14532D]'
                          : 'text-[#A8A29E]'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </nav>

            {/* Footer Drawer */}
            <div className="border-t border-[#E6E4DF] bg-white px-5 py-3.5 text-xs text-[#78716C]">
              <p className="font-semibold text-[#1C1917]">
                Wilayah Layanan Resmi
              </p>
              <p className="mt-0.5">
                Kota Pangkal Pinang · Kepulauan Bangka Belitung
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
