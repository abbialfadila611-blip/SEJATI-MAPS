import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '../types';
import { formatRupiah } from '../utils/geoPangkalPinang';
import { MenuVisual } from './MenuVisual';

interface MenuDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, qty: number) => void;
}

export function MenuDetailModal({
  item,
  onClose,
  onAddToCart,
}: MenuDetailModalProps) {
  const [qty, setQty] = useState(1);

  if (!item) return null;

  const isAvailable = item.status === 'tersedia';

  const handleAdd = () => {
    if (!isAvailable) return;
    onAddToCart(item, qty);
    setQty(1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-detail-title"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E6E4DF] bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#E6E4DF] bg-white/95 text-[#1C1917] transition-colors hover:bg-[#F3F1EC]"
          aria-label="Tutup detail menu"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2">
          <MenuVisual
            foto={item.foto}
            namaMenu={item.nama_menu}
            kategoriId={item.kategori_id}
            className="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[300px]"
          />

          <div className="flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#78716C]">
                <span>{item.nama_kategori ?? 'Menu Kuliner'}</span>
                <span aria-hidden="true">·</span>
                <span className={isAvailable ? 'text-[#14532D]' : 'text-[#B91C1C]'}>
                  {isAvailable ? 'Tersedia' : 'Stok Habis'}
                </span>
              </div>

              <h2
                id="menu-detail-title"
                className="font-display mt-2 text-2xl font-bold text-[#1C1917]"
              >
                {item.nama_menu}
              </h2>

              <p className="font-mono tabular-nums mt-2 text-xl font-semibold text-[#14532D]">
                {formatRupiah(item.harga)}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-[#57534E]">
                {item.deskripsi || 'Disajikan segar dari dapur Warkop Sejati Pangkal Pinang.'}
              </p>
            </div>

            <div className="mt-6 border-t border-[#E6E4DF] pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-[#57534E]">Jumlah</span>
                <div className="flex items-center rounded-lg border border-[#E6E4DF] bg-[#FAFAF8]">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={!isAvailable || qty <= 1}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#1C1917] disabled:opacity-40"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-mono tabular-nums w-10 text-center text-sm font-semibold text-[#1C1917]">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    disabled={!isAvailable}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#1C1917] disabled:opacity-40"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!isAvailable}
                className="mt-4 inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534] disabled:cursor-not-allowed disabled:bg-[#A8A29E]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {isAvailable
                    ? `Tambah · ${formatRupiah(item.harga * qty)}`
                    : 'Menu Sedang Habis'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
