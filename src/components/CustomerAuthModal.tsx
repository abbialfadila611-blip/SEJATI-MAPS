import { X } from 'lucide-react';
import type { AdminUser, Pelanggan } from '../types';
import { CustomerAuthPanel } from './CustomerAuthPanel';

interface CustomerAuthModalProps {
  open: boolean;
  onClose: () => void;
  activeAdmin?: AdminUser | null;
  onAuthenticated: (customer: Pelanggan, token: string) => void;
  onAdminAuthenticated?: (admin: AdminUser, token: string) => void;
  onOpenAdminPanel?: () => void;
}

export function CustomerAuthModal({
  open,
  onClose,
  activeAdmin = null,
  onAuthenticated,
  onAdminAuthenticated,
  onOpenAdminPanel,
}: CustomerAuthModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Daftar dan Login Akun"
    >
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#E6E4DF] bg-[#FAFAF8] p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1C1917]">
              Daftar &amp; Login SEJATI MAPS
            </h2>
            <p className="mt-1 text-sm text-[#57534E]">
              Pilih jenis akun <span className="font-medium text-[#1C1917]">Pelanggan</span> atau{' '}
              <span className="font-medium text-[#1C1917]">Admin</span> di kolom Login, atau buat akun pelanggan baru.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#E6E4DF] bg-white text-[#1C1917] hover:bg-[#F3F1EC]"
            aria-label="Tutup jendela akun"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <CustomerAuthPanel
          layout="columns"
          activeAdmin={activeAdmin}
          onAuthenticated={(c, t) => {
            onAuthenticated(c, t);
            onClose();
          }}
          onAdminAuthenticated={
            onAdminAuthenticated
              ? (a, t) => {
                  onAdminAuthenticated(a, t);
                  onClose();
                }
              : undefined
          }
          onOpenAdminPanel={
            onOpenAdminPanel
              ? () => {
                  onClose();
                  onOpenAdminPanel();
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
