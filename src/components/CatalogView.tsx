import { Search, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { KategoriMenu, MenuItem } from '../types';
import { formatRupiah } from '../utils/geoPangkalPinang';
import { MenuVisual } from './MenuVisual';

interface CatalogViewProps {
  kategoriList: KategoriMenu[];
  menuList: MenuItem[];
  selectedCategoryId: number | null;
  onSelectCategoryId: (id: number | null) => void;
  onSelectMenu: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
}

export function CatalogView({
  kategoriList,
  menuList,
  selectedCategoryId,
  onSelectCategoryId,
  onSelectMenu,
  onAddToCart,
}: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredMenu = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menuList.filter((item) => {
      if (selectedCategoryId !== null && item.kategori_id !== selectedCategoryId) {
        return false;
      }
      if (onlyAvailable && item.status !== 'tersedia') {
        return false;
      }
      if (q) {
        const hay = `${item.nama_menu} ${item.deskripsi ?? ''} ${item.nama_kategori ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [menuList, selectedCategoryId, onlyAvailable, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#E6E4DF] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1C1917]">
            Katalog Makanan &amp; Minuman
          </h1>
          <p className="mt-1 text-sm text-[#57534E]">
            Menampilkan {filteredMenu.length} dari {menuList.length} menu resmi Warkop Sejati Pangkal Pinang.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, roti, mie..."
              aria-label="Cari menu makanan atau minuman"
              className="min-h-[42px] w-full rounded-lg border border-[#E6E4DF] bg-white pr-4 pl-10 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#14532D] focus:outline-none sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyAvailable((v) => !v)}
            className={`min-h-[42px] cursor-pointer rounded-lg border px-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              onlyAvailable
                ? 'border-[#14532D] bg-[#14532D] text-white'
                : 'border-[#E6E4DF] bg-white text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            {onlyAvailable ? 'Hanya Tersedia' : 'Semua Status'}
          </button>
        </div>
      </div>

      {/* Filter 8 Kategori Menu */}
      <div
        className="mt-5 flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#F3F1EC] p-1.5"
        role="tablist"
        aria-label="Filter kategori menu"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategoryId === null}
          onClick={() => onSelectCategoryId(null)}
          className={`min-h-[38px] cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            selectedCategoryId === null
              ? 'bg-white text-[#1C1917] shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          Semua Kategori
        </button>
        {kategoriList.map((kat) => (
          <button
            key={kat.id}
            type="button"
            role="tab"
            aria-selected={selectedCategoryId === kat.id}
            onClick={() => onSelectCategoryId(kat.id)}
            className={`min-h-[38px] cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategoryId === kat.id
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            {kat.nama_kategori}
          </button>
        ))}
      </div>

      {/* Grid Produk */}
      {filteredMenu.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#E6E4DF] bg-white p-10 text-center">
          <p className="text-base font-semibold text-[#1C1917]">
            Menu tidak ditemukan
          </p>
          <p className="mt-1 text-sm text-[#57534E]">
            Coba ubah kata kunci pencarian atau pilih kategori lain.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setOnlyAvailable(false);
              onSelectCategoryId(null);
            }}
            className="mt-4 min-h-[40px] cursor-pointer rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white"
          >
            Atur Ulang Filter
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMenu.map((item) => {
            const isAvailable = item.status === 'tersedia';
            return (
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
                      <span>{item.nama_kategori ?? 'Umum'}</span>
                      <span aria-hidden="true">·</span>
                      <span className={isAvailable ? 'text-[#14532D]' : 'text-[#B91C1C]'}>
                        {isAvailable ? 'Tersedia' : 'Habis'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectMenu(item)}
                      className="mt-1.5 cursor-pointer text-left text-base font-semibold text-[#1C1917] hover:text-[#14532D]"
                    >
                      {item.nama_menu}
                    </button>

                    <p className="mt-1 line-clamp-2 text-sm text-[#57534E]">
                      {item.deskripsi || 'Hidangan pilihan Warkop Sejati Pangkal Pinang.'}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#E6E4DF] pt-3.5">
                    <span className="font-mono tabular-nums text-[15px] font-semibold text-[#1C1917]">
                      {formatRupiah(item.harga)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectMenu(item)}
                        className="min-h-[38px] cursor-pointer rounded-lg border border-[#E6E4DF] px-3 py-1.5 text-xs font-medium text-[#57534E] hover:bg-[#F3F1EC] hover:text-[#1C1917] whitespace-nowrap shrink-0"
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => onAddToCart(item)}
                        className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg bg-[#14532D] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#166534] disabled:cursor-not-allowed disabled:bg-[#A8A29E] whitespace-nowrap shrink-0"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{isAvailable ? 'Pesan' : 'Habis'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
