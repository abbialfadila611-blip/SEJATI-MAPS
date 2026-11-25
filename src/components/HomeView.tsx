import { ArrowRight, CheckCircle2, Compass, MapPin, ShieldAlert, Smartphone, User } from 'lucide-react';
import type { GeoValidationResult, KategoriMenu, MenuItem, Pelanggan, Warkop } from '../types';
import { formatRupiah } from '../utils/geoPangkalPinang';
import type { AppRoute } from './Navbar';
import { MenuVisual } from './MenuVisual';
import { PangkalPinangMap } from './PangkalPinangMap';

interface HomeViewProps {
  kategoriList: KategoriMenu[];
  menuList: MenuItem[];
  warkopList: Warkop[];
  customer: Pelanggan | null;
  customerPosition: { latitude: number; longitude: number } | null;
  geoResult: GeoValidationResult | null;
  gpsLoading: boolean;
  onDetectGps: () => void;
  onOpenCustomerAuth: () => void;
  onNavigate: (route: AppRoute) => void;
  onSelectCategory: (kategoriId: number) => void;
  onSelectMenu: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  showInstallApp?: boolean;
  onOpenInstallApp?: () => void;
}

export function HomeView({
  kategoriList,
  menuList,
  warkopList,
  customer,
  customerPosition,
  geoResult,
  gpsLoading,
  onDetectGps,
  onOpenCustomerAuth,
  onNavigate,
  onSelectCategory,
  onSelectMenu,
  onAddToCart,
  showInstallApp = false,
  onOpenInstallApp,
}: HomeViewProps) {
  const availableCount = menuList.filter((m) => m.status === 'tersedia').length;
  const featuredMenu = menuList.filter((m) => m.status === 'tersedia').slice(0, 6);
  const primaryWarkop = warkopList[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Bagian 1: Hero 2-Kolom Seimbang + Peta GIS Langsung */}
      <section className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
        <div className="flex flex-col justify-between rounded-2xl border border-[#E6E4DF] bg-white p-6 sm:p-8 lg:col-span-6">
          <div>
            <p className="text-xs font-medium text-[#57534E]">
              Kota Pangkal Pinang · Kepulauan Bangka Belitung
            </p>
            <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-[#1C1917] [text-wrap:balance] sm:text-4xl lg:text-[42px] lg:leading-[1.12]">
              Kuliner Pangkal Pinang Terhubung Peta Digital
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#57534E]">
              Temukan titik lokasi usaha kuliner di seluruh kecamatan Kota Pangkal Pinang,
              verifikasi jangkauan GPS Anda secara langsung, dan pesan menu favorit dari
              {' '}
              <span className="font-medium text-[#1C1917]">
                {primaryWarkop ? primaryWarkop.nama : 'Warkop Sejati'}
              </span>
              .
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('katalog')}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534] whitespace-nowrap shrink-0"
            >
              <span>Jelajahi Katalog Menu</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('peta')}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F3F1EC] whitespace-nowrap shrink-0"
            >
              <MapPin className="h-4 w-4 text-[#14532D]" />
              <span>Buka Peta GIS</span>
            </button>
            <button
              type="button"
              onClick={onDetectGps}
              disabled={gpsLoading}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#E6E4DF] bg-white px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F3F1EC] disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Compass className="h-4 w-4 text-[#14532D]" />
              <span>{gpsLoading ? 'Mendeteksi GPS...' : 'Deteksi GPS Saya'}</span>
            </button>
            <button
              type="button"
              onClick={() => (customer ? onNavigate('riwayat') : onOpenCustomerAuth())}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#E6E4DF] bg-white px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F3F1EC] whitespace-nowrap shrink-0"
            >
              <User className="h-4 w-4 text-[#14532D]" />
              <span>{customer ? customer.nama : 'Daftar / Login'}</span>
            </button>
            {showInstallApp && onOpenInstallApp && (
              <button
                type="button"
                onClick={onOpenInstallApp}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#14532D]/30 bg-[#14532D]/8 px-4 py-2.5 text-sm font-semibold text-[#14532D] transition-colors hover:bg-[#14532D]/14 whitespace-nowrap shrink-0"
              >
                <Smartphone className="h-4 w-4 text-[#14532D]" />
                <span>Pasang di Android</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:col-span-6">
          <PangkalPinangMap
            warkopList={warkopList}
            customerPosition={customerPosition}
            heightClass="h-[340px] lg:h-full lg:min-h-[380px]"
          />
        </div>
      </section>

      {/* Baris Indikator Ringkas 4 Kolom */}
      <section
        aria-label="Ringkasan layanan wilayah"
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-xl border border-[#E6E4DF] bg-white p-4">
          <p className="text-xs text-[#78716C]">Usaha Kuliner Aktif</p>
          <p className="font-mono tabular-nums mt-1 text-xl font-semibold text-[#1C1917]">
            {warkopList.length} Lokasi
          </p>
          <p className="mt-1 truncate text-xs text-[#57534E]">
            {primaryWarkop?.alamat ?? 'Jalan Pasar Mambo, Rangkui'}
          </p>
        </div>

        <div className="rounded-xl border border-[#E6E4DF] bg-white p-4">
          <p className="text-xs text-[#78716C]">Katalog Menu</p>
          <p className="font-mono tabular-nums mt-1 text-xl font-semibold text-[#1C1917]">
            {availableCount} Tersedia
          </p>
          <p className="mt-1 text-xs text-[#57534E]">
            Terbagi dalam {kategoriList.length} kategori pilihan
          </p>
        </div>

        <div className="rounded-xl border border-[#E6E4DF] bg-white p-4">
          <p className="text-xs text-[#78716C]">Area Jangkauan</p>
          <p className="mt-1 text-lg font-semibold text-[#1C1917]">Kota Pangkal Pinang</p>
          <p className="mt-1 text-xs text-[#57534E]">
            7 Kecamatan · Validasi batas wilayah
          </p>
        </div>

        <div className="rounded-xl border border-[#E6E4DF] bg-white p-4">
          <p className="text-xs text-[#78716C]">Status Lokasi GPS</p>
          {geoResult ? (
            <div className="mt-1 flex items-start gap-2">
              {geoResult.valid ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#14532D]" />
              ) : (
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${
                    geoResult.valid ? 'text-[#14532D]' : 'text-[#B91C1C]'
                  }`}
                >
                  {geoResult.valid ? 'Dalam Wilayah Layanan' : 'Di Luar Pangkal Pinang'}
                </p>
                <p className="text-xs text-[#57534E]">
                  {geoResult.valid
                    ? `${geoResult.kecamatan_estimasi ?? 'Pangkal Pinang'}`
                    : 'Pemesanan dibatasi di Pangkal Pinang'}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-sm font-medium text-[#1C1917]">Belum Terdeteksi</p>
              <button
                type="button"
                onClick={onDetectGps}
                className="mt-0.5 cursor-pointer text-xs font-medium text-[#14532D] underline underline-offset-4"
              >
                Aktifkan deteksi lokasi
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bagian 2: Delapan Kategori Menu */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E6E4DF] pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1C1917]">
              Delapan Kategori Menu
            </h2>
            <p className="mt-1 text-sm text-[#57534E]">
              Pilih kategori hidangan dan minuman khas untuk menyaring katalog secara langsung.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('katalog')}
            className="cursor-pointer text-sm font-medium text-[#14532D] hover:underline whitespace-nowrap shrink-0"
          >
            Lihat semua ({menuList.length})
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kategoriList.map((kat, idx) => {
            const count = menuList.filter((m) => m.kategori_id === kat.id).length;
            return (
              <button
                key={kat.id}
                type="button"
                onClick={() => onSelectCategory(kat.id)}
                className="flex min-h-[76px] cursor-pointer flex-col justify-between rounded-xl border border-[#E6E4DF] bg-white p-4 text-left transition-colors hover:border-[#14532D]/40 hover:bg-[#F3F1EC]/50"
              >
                <span className="font-mono tabular-nums text-xs text-[#78716C]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-[#1C1917]">
                    {kat.nama_kategori}
                  </span>
                  <span className="font-mono tabular-nums text-xs text-[#57534E]">
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Bagian 3: Menu Pilihan Warkop Sejati */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E6E4DF] pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1C1917]">
              Pilihan Menu Warkop Sejati
            </h2>
            <p className="mt-1 text-sm text-[#57534E]">
              Racikan kopi, teh tarik, roti panggang, hingga hidangan utama siap dipesan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('katalog')}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#E6E4DF] bg-white px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#F3F1EC] whitespace-nowrap shrink-0"
          >
            <span>Buka Katalog Lengkap</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredMenu.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#E6E4DF] bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => onSelectMenu(item)}
                className="cursor-pointer text-left"
              >
                <MenuVisual
                  foto={item.foto}
                  namaMenu={item.nama_menu}
                  kategoriId={item.kategori_id}
                />
              </button>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#78716C]">
                    <span>{item.nama_kategori ?? 'Menu'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#14532D]">Tersedia</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectMenu(item)}
                    className="mt-1.5 cursor-pointer text-left text-base font-semibold text-[#1C1917] hover:text-[#14532D]"
                  >
                    {item.nama_menu}
                  </button>
                  <p className="mt-1 line-clamp-2 text-sm text-[#57534E]">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#E6E4DF] pt-3.5">
                  <span className="font-mono tabular-nums text-[15px] font-semibold text-[#1C1917]">
                    {formatRupiah(item.harga)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddToCart(item)}
                    className="min-h-[38px] cursor-pointer rounded-lg border border-[#14532D] px-3.5 py-1.5 text-xs font-semibold text-[#14532D] transition-colors hover:bg-[#14532D] hover:text-white whitespace-nowrap shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
