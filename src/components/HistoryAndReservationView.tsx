import { CalendarCheck2, LogOut, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AdminUser, Pelanggan, Pesanan, Reservasi } from '../types';
import { formatRupiah } from '../utils/geoPangkalPinang';
import { CustomerAuthPanel } from './CustomerAuthPanel';

interface HistoryAndReservationViewProps {
  mode: 'riwayat' | 'reservasi';
  customer: Pelanggan | null;
  customerToken: string | null;
  activeAdmin?: AdminUser | null;
  onCustomerAuthenticated: (customer: Pelanggan, token: string) => void;
  onAdminAuthenticated?: (admin: AdminUser, token: string) => void;
  onOpenAdminPanel?: () => void;
  onCustomerLogout: () => void;
  onSwitchMode: (mode: 'riwayat' | 'reservasi') => void;
}

export function HistoryAndReservationView({
  mode,
  customer,
  customerToken,
  activeAdmin = null,
  onCustomerAuthenticated,
  onAdminAuthenticated,
  onOpenAdminPanel,
  onCustomerLogout,
  onSwitchMode,
}: HistoryAndReservationViewProps) {
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [reservations, setReservations] = useState<Reservasi[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [jam, setJam] = useState('19:00');
  const [jumlahOrang, setJumlahOrang] = useState(2);
  const [catatan, setCatatan] = useState('');
  const [resBusy, setResBusy] = useState(false);
  const [resMsg, setResMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!customerToken) {
      setOrders([]);
      setReservations([]);
      return;
    }

    let cancelled = false;
    setLoadingData(true);
    Promise.all([
      api.getMyOrders(customerToken),
      api.getMyReservations(customerToken),
    ])
      .then(([ordRes, resRes]) => {
        if (!cancelled) {
          setOrders(ordRes.orders);
          setReservations(resRes.reservations);
        }
      })
      .catch(() => {
        // Biarkan kosong jika sesi berakhir
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerToken, mode]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToken) return;
    setResMsg(null);
    setResBusy(true);
    try {
      const res = await api.createReservation(customerToken, {
        tanggal,
        jam,
        jumlah_orang: jumlahOrang,
        catatan,
      });
      setReservations((prev) => [res.reservation, ...prev]);
      setCatatan('');
      setResMsg('Permintaan reservasi meja berhasil dikirim.');
    } catch (err) {
      setResMsg(err instanceof Error ? err.message : 'Gagal mengirim reservasi.');
    } finally {
      setResBusy(false);
    }
  };

  if (!customer || !customerToken) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-[#1C1917] sm:text-3xl">
            {mode === 'reservasi'
              ? 'Daftar atau Login untuk Reservasi Meja'
              : 'Daftar & Login Akun SEJATI MAPS'}
          </h1>
          <p className="mt-1 text-sm text-[#57534E]">
            Pilih akun Pelanggan atau Admin di kolom Login, atau daftarkan akun pelanggan baru.
          </p>
        </div>

        <CustomerAuthPanel
          layout="columns"
          activeAdmin={activeAdmin}
          onAuthenticated={onCustomerAuthenticated}
          onAdminAuthenticated={onAdminAuthenticated}
          onOpenAdminPanel={onOpenAdminPanel}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6E4DF] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C1917] sm:text-3xl">
            {mode === 'reservasi' ? 'Reservasi Meja Warkop Sejati' : 'Riwayat Pesanan Saya'}
          </h1>
          <p className="mt-1 text-sm text-[#57534E]">
            Pelanggan: <span className="font-semibold text-[#1C1917]">{customer.nama}</span> ·{' '}
            <span className="font-mono">{customer.telepon}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-lg bg-[#F3F1EC] p-1">
            <button
              type="button"
              onClick={() => onSwitchMode('riwayat')}
              className={`min-h-[38px] cursor-pointer rounded-md px-3.5 text-xs font-semibold ${
                mode === 'riwayat' ? 'bg-white text-[#1C1917]' : 'text-[#57534E]'
              }`}
            >
              Riwayat Pesanan
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('reservasi')}
              className={`min-h-[38px] cursor-pointer rounded-md px-3.5 text-xs font-semibold ${
                mode === 'reservasi' ? 'bg-white text-[#1C1917]' : 'text-[#57534E]'
              }`}
            >
              Reservasi Meja
            </button>
          </div>

          <button
            type="button"
            onClick={onCustomerLogout}
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#E6E4DF] bg-white px-3 text-xs font-medium text-[#57534E] hover:text-[#B91C1C]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {mode === 'riwayat' ? (
        <div className="mt-6">
          {loadingData ? (
            <div className="rounded-xl border border-[#E6E4DF] bg-white p-8 text-center text-sm text-[#57534E]">
              Memuat riwayat pesanan...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-[#E6E4DF] bg-white p-10 text-center">
              <Receipt className="mx-auto h-8 w-8 text-[#78716C]" />
              <p className="mt-3 text-base font-semibold text-[#1C1917]">
                Belum ada riwayat pesanan
              </p>
              <p className="mt-1 text-sm text-[#57534E]">
                Pesanan yang Anda checkout akan tercatat langsung di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-xl border border-[#E6E4DF] bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E4DF] pb-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-[#1C1917]">
                        {order.kode_pesanan}
                      </span>
                      <span className="mx-2 text-[#A8A29E]">·</span>
                      <span className="text-xs text-[#57534E]">
                        {order.jenis_pesanan === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang'}
                      </span>
                      <span className="mx-2 text-[#A8A29E]">·</span>
                      <span className="font-mono text-xs text-[#78716C]">
                        {new Date(order.tanggal_pesanan).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="text-xs font-semibold">
                      <span className="text-[#14532D]">
                        Pesanan: {order.status.toUpperCase()}
                      </span>
                      {order.pembayaran && (
                        <>
                          <span className="mx-2 text-[#A8A29E]">·</span>
                          <span className="text-[#57534E]">
                            Bayar ({order.pembayaran.metode}): {order.pembayaran.status.replace('_', ' ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-[#57534E]">
                        <span>
                          {item.nama_menu ?? `Menu #${item.menu_id}`} × {item.jumlah}
                        </span>
                        <span className="font-mono tabular-nums text-[#1C1917]">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between border-t border-[#E6E4DF] pt-3 text-sm font-bold text-[#1C1917]">
                    <span>Total</span>
                    <span className="font-mono tabular-nums text-[#14532D]">
                      {formatRupiah(order.total)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-[#E6E4DF] bg-white p-6 lg:col-span-5">
            <h2 className="font-display text-lg font-bold text-[#1C1917]">
              Buat Reservasi Meja
            </h2>
            <p className="mt-1 text-xs text-[#57534E]">
              Warkop Sejati · Jalan Pasar Mambo, Kec. Rangkui, Pangkal Pinang
            </p>

            <form onSubmit={handleCreateReservation} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#57534E]">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E]">
                    Jam
                  </label>
                  <input
                    type="time"
                    required
                    value={jam}
                    onChange={(e) => setJam(e.target.value)}
                    className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Jumlah Orang
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={jumlahOrang}
                  onChange={(e) => setJumlahOrang(Number(e.target.value))}
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] px-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Area dekat jendela atau kursi bayi"
                  className="mt-1 w-full rounded-lg border border-[#E6E4DF] p-3 text-sm"
                />
              </div>

              {resMsg && (
                <p className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-xs font-medium text-[#14532D]">
                  {resMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={resBusy}
                className="min-h-[44px] w-full cursor-pointer rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166534]"
              >
                {resBusy ? 'Mengirim...' : 'Kirim Permintaan Reservasi'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            <h2 className="text-sm font-semibold text-[#1C1917]">
              Daftar Reservasi Anda ({reservations.length})
            </h2>
            {reservations.length === 0 ? (
              <div className="mt-3 rounded-xl border border-[#E6E4DF] bg-white p-8 text-center">
                <CalendarCheck2 className="mx-auto h-7 w-7 text-[#78716C]" />
                <p className="mt-2 text-sm text-[#57534E]">
                  Belum ada reservasi meja tercatat.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-[#E6E4DF] bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-[#1C1917]">
                        {r.tanggal} · {r.jam}
                      </span>
                      <span className="text-xs font-semibold text-[#14532D]">
                        Status: {r.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#57534E]">
                      Jumlah tamu: <span className="font-mono font-semibold">{r.jumlah_orang}</span> orang
                      {r.catatan ? ` · Catatan: ${r.catatan}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
