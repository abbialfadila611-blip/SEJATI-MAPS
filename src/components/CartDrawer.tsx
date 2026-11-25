import {
  CheckCircle2,
  Compass,
  Minus,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api';
import type {
  AdminUser,
  CartItem,
  GeoValidationResult,
  JenisPesanan,
  Pelanggan,
  Pesanan,
} from '../types';
import { formatRupiah } from '../utils/geoPangkalPinang';
import { CustomerAuthPanel } from './CustomerAuthPanel';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (menuId: number, delta: number) => void;
  onRemoveItem: (menuId: number) => void;
  onClearCart: () => void;
  customer: Pelanggan | null;
  customerToken: string | null;
  activeAdmin?: AdminUser | null;
  onCustomerAuthenticated: (customer: Pelanggan, token: string) => void;
  onAdminAuthenticated?: (admin: AdminUser, token: string) => void;
  onOpenAdminPanel?: () => void;
  customerPosition: { latitude: number; longitude: number } | null;
  geoResult: GeoValidationResult | null;
  gpsLoading: boolean;
  onDetectGps: () => void;
  onOrderSuccess: (order: Pesanan) => void;
}

export function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  customer,
  customerToken,
  activeAdmin = null,
  onCustomerAuthenticated,
  onAdminAuthenticated,
  onOpenAdminPanel,
  customerPosition,
  geoResult,
  gpsLoading,
  onDetectGps,
  onOrderSuccess,
}: CartDrawerProps) {
  const [jenisPesanan, setJenisPesanan] = useState<JenisPesanan>('takeaway');
  const [metodePembayaran, setMetodePembayaran] = useState('Tunai');
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Pesanan | null>(null);

  if (!open) return null;

  const total = items.reduce((sum, item) => sum + item.menu.harga * item.jumlah, 0);

  const handleCheckout = async () => {
    if (!customerToken) {
      setCheckoutError('Silakan daftar atau masuk sebagai pelanggan terlebih dahulu.');
      return;
    }
    if (!customerPosition) {
      setCheckoutError('Deteksi GPS pelanggan wajib dilakukan sebelum checkout.');
      return;
    }
    setCheckoutError(null);
    setCheckoutBusy(true);
    try {
      const res = await api.checkoutOrder(customerToken, {
        jenis_pesanan: jenisPesanan,
        metode_pembayaran: metodePembayaran,
        latitude: customerPosition.latitude,
        longitude: customerPosition.longitude,
        items: items.map((i) => ({ menu_id: i.menu.id, jumlah: i.jumlah })),
      });
      setCompletedOrder(res.pesanan);
      onClearCart();
      onOrderSuccess(res.pesanan);
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Checkout gagal diproses oleh server.'
      );
    } finally {
      setCheckoutBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja & Checkout"
    >
      <div className="flex h-full w-full max-w-lg flex-col border-l border-[#E6E4DF] bg-[#FAFAF8] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E6E4DF] bg-white px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1C1917]">
              Keranjang &amp; Checkout
            </h2>
            <p className="text-xs text-[#57534E]">
              Validasi wilayah Pangkal Pinang diterapkan pada server
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCompletedOrder(null);
              onClose();
            }}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#E6E4DF] bg-white text-[#1C1917] hover:bg-[#F3F1EC]"
            aria-label="Tutup keranjang"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {completedOrder ? (
            <div className="rounded-xl border border-[#BBF7D0] bg-white p-6">
              <div className="flex items-center gap-2.5 text-[#14532D]">
                <CheckCircle2 className="h-6 w-6" />
                <h3 className="font-display text-xl font-bold">
                  Pesanan Diterima
                </h3>
              </div>
              <p className="mt-2 text-sm text-[#57534E]">
                Kode pesanan Anda:{' '}
                <span className="font-mono font-semibold text-[#1C1917]">
                  {completedOrder.kode_pesanan}
                </span>
              </p>

              <div className="mt-4 divide-y divide-[#E6E4DF] border-t border-b border-[#E6E4DF] py-2 text-sm">
                {completedOrder.items?.map((line, idx) => (
                  <div key={idx} className="flex justify-between py-2">
                    <span className="text-[#1C1917]">
                      {line.nama_menu} × {line.jumlah}
                    </span>
                    <span className="font-mono tabular-nums font-medium text-[#1C1917]">
                      {formatRupiah(line.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-base font-bold text-[#1C1917]">
                <span>Total</span>
                <span className="font-mono tabular-nums text-[#14532D]">
                  {formatRupiah(completedOrder.total)}
                </span>
              </div>

              <p className="mt-2 text-xs text-[#57534E]">
                Jenis: {completedOrder.jenis_pesanan === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang'}
                {' · '}
                Metode: {completedOrder.pembayaran?.metode ?? 'Tunai'}
              </p>

              <button
                type="button"
                onClick={() => {
                  setCompletedOrder(null);
                  onClose();
                }}
                className="mt-6 min-h-[44px] w-full cursor-pointer rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166534]"
              >
                Selesai
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-[#E6E4DF] bg-white p-8 text-center">
              <p className="text-base font-semibold text-[#1C1917]">
                Keranjang masih kosong
              </p>
              <p className="mt-1 text-sm text-[#57534E]">
                Pilih makanan atau minuman dari katalog untuk memulai pemesanan.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Daftar Item Keranjang */}
              <div className="divide-y divide-[#E6E4DF] rounded-xl border border-[#E6E4DF] bg-white px-4">
                {items.map((item) => (
                  <div
                    key={item.menu.id}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1C1917]">
                        {item.menu.nama_menu}
                      </p>
                      <p className="font-mono tabular-nums text-xs text-[#57534E]">
                        {formatRupiah(item.menu.harga)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-[#E6E4DF] bg-[#FAFAF8]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.menu.id, -1)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#1C1917]"
                          aria-label={`Kurangi ${item.menu.nama_menu}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono tabular-nums w-7 text-center text-xs font-semibold">
                          {item.jumlah}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.menu.id, 1)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#1C1917]"
                          aria-label={`Tambah ${item.menu.nama_menu}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.menu.id)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                        aria-label={`Hapus ${item.menu.nama_menu}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lokasi GPS Pelanggan */}
              <div className="rounded-xl border border-[#E6E4DF] bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1C1917]">
                    Verifikasi GPS Pangkal Pinang
                  </span>
                  <button
                    type="button"
                    onClick={onDetectGps}
                    disabled={gpsLoading}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#14532D] hover:underline"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>{gpsLoading ? 'Mendeteksi...' : 'Perbarui GPS'}</span>
                  </button>
                </div>

                {geoResult ? (
                  <div
                    className={`mt-2.5 flex items-start gap-2 rounded-lg border p-3 text-xs ${
                      geoResult.valid
                        ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]'
                        : 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
                    }`}
                  >
                    {geoResult.valid ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {geoResult.valid
                          ? `Dalam Wilayah (${geoResult.kecamatan_estimasi ?? 'Pangkal Pinang'})`
                          : 'Di Luar Wilayah Pangkal Pinang'}
                      </p>
                      <p className="font-mono tabular-nums mt-0.5 text-[11px]">
                        {geoResult.latitude.toFixed(6)}, {geoResult.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-[#57534E]">
                    Tekan <strong>Perbarui GPS</strong> agar lokasi Anda terverifikasi di Kota Pangkal Pinang.
                  </p>
                )}
              </div>

              {/* Akun Pelanggan */}
              {!customer ? (
                <div className="rounded-xl border border-[#E6E4DF] bg-white p-4">
                  <CustomerAuthPanel
                    layout="tabs"
                    activeAdmin={activeAdmin}
                    onAuthenticated={onCustomerAuthenticated}
                    onAdminAuthenticated={onAdminAuthenticated}
                    onOpenAdminPanel={onOpenAdminPanel}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-[#E6E4DF] bg-white p-4">
                  <p className="text-xs text-[#78716C]">Pemesan Terautentikasi</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#1C1917]">
                    {customer.nama} · <span className="font-mono">{customer.telepon}</span>
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#57534E]">
                        Jenis Pesanan
                      </label>
                      <select
                        value={jenisPesanan}
                        onChange={(e) => setJenisPesanan(e.target.value as JenisPesanan)}
                        className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] bg-white px-2.5 text-sm"
                      >
                        <option value="takeaway">Bawa Pulang (Takeaway)</option>
                        <option value="dine_in">Makan di Tempat (Dine In)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#57534E]">
                        Metode Bayar
                      </label>
                      <select
                        value={metodePembayaran}
                        onChange={(e) => setMetodePembayaran(e.target.value)}
                        className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] bg-white px-2.5 text-sm"
                      >
                        <option value="Tunai">Tunai</option>
                        <option value="QRIS">QRIS</option>
                        <option value="Transfer Bank">Transfer Bank</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {checkoutError && (
                <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3.5 text-xs font-medium text-[#B91C1C]">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!completedOrder && items.length > 0 && (
          <div className="border-t border-[#E6E4DF] bg-white px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#57534E]">Total Pembayaran</span>
              <span className="font-mono tabular-nums text-lg font-bold text-[#1C1917]">
                {formatRupiah(total)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutBusy || !customer}
              className="mt-3 min-h-[44px] w-full cursor-pointer rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534] disabled:cursor-not-allowed disabled:bg-[#A8A29E]"
            >
              {checkoutBusy ? 'Memvalidasi Lokasi & Memproses...' : 'Checkout Pesanan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
