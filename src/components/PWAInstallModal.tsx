import {
  Check,
  Copy,
  Download,
  MoreVertical,
  Share,
  Smartphone,
  Terminal,
  WifiOff,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-[#F59E0B]/40 bg-[#1C1917] px-4 py-2.5 text-xs font-medium text-[#FAFAF8] shadow-lg"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-[#F59E0B]" />
      <span>Mode Offline — Menampilkan data katalog tersimpan.</span>
    </div>
  );
}

interface PWAInstallModalProps {
  open: boolean;
  onClose: () => void;
  canNativePrompt: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isInIframe: boolean;
  onTriggerNativeInstall: () => Promise<boolean>;
}

export function PWAInstallModal({
  open,
  onClose,
  canNativePrompt,
  isInstalled,
  isIOS,
  isInIframe,
  onTriggerNativeInstall,
}: PWAInstallModalProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'apk'>(
    isIOS ? 'ios' : 'android'
  );
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!open) return null;

  const appUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyUrl = async () => {
    if (!appUrl || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      // Abaikan bila clipboard ditolak oleh browser
    }
  };

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const accepted = await onTriggerNativeInstall();
      if (accepted) {
        onClose();
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Pasang Aplikasi SEJATI MAPS di Android"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E6E4DF] bg-[#FAFAF8] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E4DF] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="Ikon SEJATI MAPS"
              className="h-11 w-11 rounded-xl border border-[#E6E4DF] object-cover"
            />
            <div>
              <h2 className="font-display text-lg font-bold text-[#1C1917]">
                Unduh &amp; Pasang di Android
              </h2>
              <p className="text-xs text-[#57534E]">
                SEJATI MAPS · Aplikasi Ringan &amp; Dukungan Offline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela instalasi"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] text-[#1C1917] hover:bg-[#F3F1EC]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
          {isInstalled ? (
            <div className="rounded-xl border border-[#14532D]/25 bg-[#14532D]/8 p-4 text-sm text-[#14532D]">
              Aplikasi SEJATI MAPS sudah terpasang dan sedang berjalan dalam mode aplikasi mandiri.
            </div>
          ) : (
            <>
              {/* Tombol Instal Langsung jika browser Android Chrome sudah siap */}
              {canNativePrompt && (
                <div className="rounded-xl border border-[#14532D]/25 bg-[#14532D]/6 p-4">
                  <p className="text-sm font-semibold text-[#1C1917]">
                    Siap Dipasang Langsung ke Layar Utama Android
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                    Perangkat Anda mendukung pemasangan instan WebAPK tanpa perlu mengunduh lewat toko aplikasi.
                  </p>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="mt-3 inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#166534] disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {installing
                        ? 'Memasang Aplikasi...'
                        : 'Instal Aplikasi SEJATI MAPS'}
                    </span>
                  </button>
                </div>
              )}

              {/* Tab Pilihan Panduan */}
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#E6E4DF] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                    activeTab === 'android'
                      ? 'bg-[#14532D] text-white'
                      : 'text-[#57534E] hover:bg-[#F3F1EC]'
                  }`}
                >
                  Android (Chrome)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                    activeTab === 'ios'
                      ? 'bg-[#14532D] text-white'
                      : 'text-[#57534E] hover:bg-[#F3F1EC]'
                  }`}
                >
                  iPhone / iPad
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('apk')}
                  className={`cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                    activeTab === 'apk'
                      ? 'bg-[#14532D] text-white'
                      : 'text-[#57534E] hover:bg-[#F3F1EC]'
                  }`}
                >
                  File .APK
                </button>
              </div>

              {activeTab === 'android' && (
                <div className="space-y-4">
                  {isInIframe && (
                    <div className="rounded-xl border border-[#F59E0B]/40 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-[#78350F]">
                      Anda sedang membuka pratinjau di dalam bingkai halaman. Untuk memasang di HP Android, salin alamat aplikasi di bawah lalu buka langsung di browser <strong>Google Chrome</strong> Android.
                    </div>
                  )}

                  <ol className="space-y-2.5 text-sm text-[#1C1917]">
                    <li className="flex items-start gap-3 rounded-xl border border-[#E6E4DF] bg-white p-3">
                      <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#14532D] text-xs font-semibold text-white">
                        1
                      </span>
                      <p className="text-xs leading-relaxed text-[#57534E]">
                        Buka alamat aplikasi <strong>SEJATI MAPS</strong> menggunakan browser{' '}
                        <strong className="text-[#1C1917]">Google Chrome</strong> di HP Android Anda.
                      </p>
                    </li>
                    <li className="flex items-start gap-3 rounded-xl border border-[#E6E4DF] bg-white p-3">
                      <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#14532D] text-xs font-semibold text-white">
                        2
                      </span>
                      <div className="text-xs leading-relaxed text-[#57534E]">
                        Ketuk ikon menu titik tiga{' '}
                        <span className="inline-flex items-center rounded border border-[#E6E4DF] bg-[#FAFAF8] px-1 py-0.5 text-[#1C1917]">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </span>{' '}
                        di pojok kanan atas browser Chrome.
                      </div>
                    </li>
                    <li className="flex items-start gap-3 rounded-xl border border-[#E6E4DF] bg-white p-3">
                      <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#14532D] text-xs font-semibold text-white">
                        3
                      </span>
                      <p className="text-xs leading-relaxed text-[#57534E]">
                        Pilih <strong className="text-[#1C1917]">Instal aplikasi</strong>{' '}
                        (atau <strong className="text-[#1C1917]">Tambahkan ke layar utama</strong>), lalu ketuk{' '}
                        <strong className="text-[#1C1917]">Instal</strong>. Ikon SEJATI MAPS akan terpasang di laci aplikasi Android Anda.
                      </p>
                    </li>
                  </ol>

                  {appUrl && (
                    <div className="rounded-xl border border-[#E6E4DF] bg-white p-3">
                      <p className="text-[11px] font-semibold tracking-wider text-[#78716C] uppercase">
                        Alamat Aplikasi untuk Dibuka di Android
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="font-mono flex-1 truncate rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] px-3 py-2 text-xs text-[#1C1917]">
                          {appUrl}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          className="inline-flex min-h-[36px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] px-3 text-xs font-semibold text-[#1C1917] hover:bg-[#F3F1EC]"
                        >
                          {copiedUrl ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#14532D]" />
                              <span>Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ios' && (
                <ol className="space-y-2.5">
                  <li className="flex items-start gap-3 rounded-xl border border-[#E6E4DF] bg-white p-3">
                    <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#14532D] text-xs font-semibold text-white">
                      1
                    </span>
                    <p className="text-xs leading-relaxed text-[#57534E]">
                      Buka <strong className="text-[#1C1917]">SEJATI MAPS</strong> menggunakan browser{' '}
                      <strong className="text-[#1C1917]">Safari</strong> di iPhone atau iPad.
                    </p>
                  </li>
                  <li className="flex items-start gap-3 rounded-xl border border-[#E6E4DF] bg-white p-3">
                    <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#14532D] text-xs font-semibold text-white">
                      2
                    </span>
                    <div className="text-xs leading-relaxed text-[#57534E]">
                      Ketuk tombol <strong className="text-[#1C1917]">Bagikan</strong>{' '}
                      <span className="inline-flex items-center rounded border border-[#E6E4DF] bg-[#FAFAF8] px-1 py-0.5 text-[#1C1917]">
                        <Share className="h-3.5 w-3.5" />
                      </span>{' '}
                      di bilah navigasi Safari.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-xl border border-[#E6E4DF] bg-white p-3">
                    <span className="font-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#14532D] text-xs font-semibold text-white">
                      3
                    </span>
                    <p className="text-xs leading-relaxed text-[#57534E]">
                      Gulir ke bawah dan pilih{' '}
                      <strong className="text-[#1C1917]">Tambah ke Layar Utama</strong>, lalu ketuk{' '}
                      <strong className="text-[#1C1917]">Tambah</strong>.
                    </p>
                  </li>
                </ol>
              )}

              {activeTab === 'apk' && (
                <div className="space-y-3 rounded-xl border border-[#E6E4DF] bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                    <Terminal className="h-4 w-4 text-[#14532D]" />
                    <span>Unduh File .APK Android via GitHub</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#57534E]">
                    Proyek Android Capacitor (<code className="font-mono text-[#1C1917]">id.pangkalpinang.sejatimaps</code>) dan workflow otomatis{' '}
                    <code className="font-mono text-[#1C1917]">.github/workflows/android.yml</code> sudah disiapkan. Anda tidak perlu laptop untuk membangun APK:
                  </p>
                  <ol className="space-y-2 text-xs leading-relaxed text-[#57534E]">
                    <li className="rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] p-2.5">
                      <strong className="text-[#1C1917]">1. Simpan / Push ke GitHub:</strong> Pastikan seluruh file proyek sudah masuk ke branch <code className="font-mono">main</code> atau <code className="font-mono">master</code> repository GitHub Anda.
                    </li>
                    <li className="rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] p-2.5">
                      <strong className="text-[#1C1917]">2. Build Otomatis Berjalan:</strong> GitHub Actions otomatis menyusun <code className="font-mono">SEJATI-MAPS-android.apk</code> dalam beberapa menit (pantau di tab <strong>Actions</strong>).
                    </li>
                    <li className="rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] p-2.5">
                      <strong className="text-[#1C1917]">3. Unduh Langsung di HP:</strong> Buka menu <strong>Releases</strong> di halaman GitHub repository Anda, ketuk <code className="font-mono">SEJATI-MAPS-android.apk</code>, lalu buka file untuk memasang aplikasi.
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E6E4DF] bg-white px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs text-[#57534E]">
            <Smartphone className="h-4 w-4 text-[#14532D]" />
            <span>Tersedia untuk Android &amp; Desktop</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] cursor-pointer rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] px-4 text-xs font-semibold text-[#1C1917] hover:bg-[#F3F1EC]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
