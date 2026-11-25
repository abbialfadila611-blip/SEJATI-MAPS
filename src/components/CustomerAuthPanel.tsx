import {
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AdminUser, Pelanggan } from '../types';

type LoginAccountRole = 'pelanggan' | 'admin';

interface CustomerAuthPanelProps {
  layout?: 'columns' | 'tabs';
  initialRole?: LoginAccountRole;
  activeAdmin?: AdminUser | null;
  onAuthenticated: (customer: Pelanggan, token: string) => void;
  onAdminAuthenticated?: (admin: AdminUser, token: string) => void;
  onOpenAdminPanel?: () => void;
}

export function CustomerAuthPanel({
  layout = 'columns',
  initialRole = 'pelanggan',
  activeAdmin = null,
  onAuthenticated,
  onAdminAuthenticated,
  onOpenAdminPanel,
}: CustomerAuthPanelProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginRole, setLoginRole] = useState<LoginAccountRole>(initialRole);

  // State Login Pelanggan
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // State Login / Setup Admin di kolom login
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [adminNama, setAdminNama] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // State Daftar Pelanggan Baru
  const [regNama, setRegNama] = useState('');
  const [regTelepon, setRegTelepon] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAlamat, setRegAlamat] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regBusy, setRegBusy] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    setLoginRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    if (loginRole !== 'admin' || !onAdminAuthenticated || activeAdmin) return;
    let cancelled = false;
    api
      .getAdminStatus()
      .then((res) => {
        if (!cancelled) setHasAdmin(res.has_admin);
      })
      .catch(() => {
        if (!cancelled) setHasAdmin(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loginRole, onAdminAuthenticated, activeAdmin]);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginBusy(true);
    try {
      const res = await api.loginCustomer({
        identifier: loginIdentifier,
        password: loginPassword,
      });
      onAuthenticated(res.pelanggan, res.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Gagal masuk ke akun pelanggan.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAdminAuthenticated) return;
    setAdminError(null);
    setAdminBusy(true);
    try {
      if (hasAdmin === false) {
        const res = await api.setupAdmin({
          nama: adminNama,
          username: adminUsername,
          password: adminPassword,
        });
        onAdminAuthenticated(res.admin, res.token);
      } else {
        const res = await api.loginAdmin({
          username: adminUsername,
          password: adminPassword,
        });
        onAdminAuthenticated(res.admin, res.token);
      }
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Gagal masuk ke akun admin.');
    } finally {
      setAdminBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegBusy(true);
    try {
      const res = await api.registerCustomer({
        nama: regNama,
        telepon: regTelepon,
        username: regUsername,
        password: regPassword,
        email: regEmail,
        alamat: regAlamat,
      });
      onAuthenticated(res.pelanggan, res.token);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Gagal mendaftarkan pelanggan.');
    } finally {
      setRegBusy(false);
    }
  };

  const renderRoleSelector = () => {
    if (!onAdminAuthenticated) return null;
    return (
      <div>
        <span className="block text-[11px] font-semibold tracking-wide text-[#78716C] uppercase">
          Pilih Jenis Akun Login
        </span>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setLoginRole('pelanggan');
              setLoginError(null);
              setAdminError(null);
            }}
            className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${
              loginRole === 'pelanggan'
                ? 'border-[#14532D] bg-[#14532D]/8 text-[#14532D]'
                : 'border-[#E6E4DF] bg-[#FAFAF8] text-[#57534E] hover:bg-[#F3F1EC]'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                loginRole === 'pelanggan'
                  ? 'bg-[#14532D] text-white'
                  : 'border border-[#E6E4DF] bg-white text-[#57534E]'
              }`}
            >
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">Pelanggan</p>
              <p className="truncate text-[10px] opacity-80">Pesan &amp; reservasi</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginRole('admin');
              setLoginError(null);
              setAdminError(null);
            }}
            className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${
              loginRole === 'admin'
                ? 'border-[#14532D] bg-[#14532D]/8 text-[#14532D]'
                : 'border-[#E6E4DF] bg-[#FAFAF8] text-[#57534E] hover:bg-[#F3F1EC]'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                loginRole === 'admin'
                  ? 'bg-[#14532D] text-white'
                  : 'border border-[#E6E4DF] bg-white text-[#57534E]'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">Admin</p>
              <p className="truncate text-[10px] opacity-80">Kelola sistem</p>
            </div>
          </button>
        </div>
      </div>
    );
  };

  const renderLoginForm = () => {
    const isAdminMode = Boolean(onAdminAuthenticated) && loginRole === 'admin';

    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[#1C1917]">
            {isAdminMode
              ? hasAdmin === false
                ? 'Buat & Masuk Akun Admin'
                : 'Login Admin'
              : 'Login Pelanggan'}
          </h3>
          <p className="mt-0.5 text-xs text-[#57534E]">
            {isAdminMode
              ? hasAdmin === false
                ? 'Belum ada akun admin terdaftar. Daftarkan admin pertama untuk mengelola menu dan pesanan.'
                : 'Masuk sebagai administrator untuk mengelola katalog, pesanan, pembayaran, dan peta GIS.'
              : 'Masuk dengan username atau nomor telepon terdaftar.'}
          </p>
        </div>

        {renderRoleSelector()}

        {isAdminMode ? (
          activeAdmin ? (
            <div className="space-y-3 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4">
              <p className="text-xs font-semibold text-[#14532D]">
                Sesi Admin Aktif
              </p>
              <p className="text-sm font-bold text-[#1C1917]">
                {activeAdmin.nama} (@{activeAdmin.username})
              </p>
              {onOpenAdminPanel && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166534]"
                >
                  <span>Buka Panel Admin</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleAdminAuth} autoComplete="on" className="space-y-3.5">
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
                    value={adminNama}
                    onChange={(e) => setAdminNama(e.target.value)}
                    placeholder="Pengelola Warkop Sejati"
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-[#E6E4DF] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#14532D] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Username Admin
                </label>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-[#E6E4DF] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#14532D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E]">
                  Password Admin
                </label>
                <div className="relative mt-1">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    name="password"
                    autoComplete={hasAdmin === false ? 'new-password' : 'current-password'}
                    required
                    minLength={6}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="min-h-[42px] w-full rounded-lg border border-[#E6E4DF] bg-white pr-11 pl-3.5 text-sm text-[#1C1917] focus:border-[#14532D] focus:outline-none"
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

              {adminError && (
                <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs font-medium text-[#B91C1C]">
                  {adminError}
                </p>
              )}

              <button
                type="submit"
                disabled={adminBusy}
                className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534] disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {adminBusy
                    ? 'Memproses...'
                    : hasAdmin === false
                    ? 'Simpan & Masuk Admin'
                    : 'Masuk sebagai Admin'}
                </span>
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleCustomerLogin} autoComplete="on" className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#57534E]">
                Username atau Nomor Telepon
              </label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Contoh: budi_pkp atau 0812..."
                className="mt-1 min-h-[42px] w-full rounded-lg border border-[#E6E4DF] bg-white px-3.5 text-sm text-[#1C1917] focus:border-[#14532D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#57534E]">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="min-h-[42px] w-full rounded-lg border border-[#E6E4DF] bg-white pr-11 pl-3.5 text-sm text-[#1C1917] focus:border-[#14532D] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass((v) => !v)}
                  className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[#78716C] hover:text-[#1C1917]"
                  aria-label={showLoginPass ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs font-medium text-[#B91C1C]">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginBusy}
              className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1C1917] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#292524] disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              <span>{loginBusy ? 'Memeriksa...' : 'Masuk sebagai Pelanggan'}</span>
            </button>
          </form>
        )}
      </div>
    );
  };

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} autoComplete="on" className="space-y-3">
      <div>
        <h3 className="font-display text-lg font-bold text-[#1C1917]">
          Daftar Pelanggan Baru
        </h3>
        <p className="mt-0.5 text-xs text-[#57534E]">
          Buat akun untuk memesan makanan, reservasi meja, dan pantau riwayat.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-[#57534E]">
            Nama Lengkap
          </label>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            value={regNama}
            onChange={(e) => setRegNama(e.target.value)}
            placeholder="Nama lengkap"
            className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] bg-white px-3 text-sm focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#57534E]">
            Nomor Telepon
          </label>
          <input
            type="tel"
            name="tel"
            autoComplete="tel"
            required
            value={regTelepon}
            onChange={(e) => setRegTelepon(e.target.value)}
            placeholder="0812xxxxxxxx"
            className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] bg-white px-3 text-sm focus:border-[#14532D] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-[#57534E]">
            Username
          </label>
          <input
            type="text"
            name="username"
            autoComplete="username"
            required
            minLength={3}
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            placeholder="Min. 3 karakter"
            className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] bg-white px-3 text-sm focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#57534E]">
            Password
          </label>
          <div className="relative mt-1">
            <input
              type={showRegPass ? 'text' : 'password'}
              name="new-password"
              autoComplete="new-password"
              required
              minLength={6}
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="Min. 6 karakter"
              className="min-h-[40px] w-full rounded-lg border border-[#E6E4DF] bg-white pr-10 pl-3 text-sm focus:border-[#14532D] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowRegPass((v) => !v)}
              className="absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-[#78716C] hover:text-[#1C1917]"
              aria-label={showRegPass ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showRegPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-[#57534E]">
            Email (Opsional)
          </label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            placeholder="nama@email.com"
            className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] bg-white px-3 text-sm focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#57534E]">
            Alamat di Pangkal Pinang (Opsional)
          </label>
          <input
            type="text"
            name="street-address"
            autoComplete="street-address"
            value={regAlamat}
            onChange={(e) => setRegAlamat(e.target.value)}
            placeholder="Jalan / Kelurahan / Kecamatan"
            className="mt-1 min-h-[40px] w-full rounded-lg border border-[#E6E4DF] bg-white px-3 text-sm focus:border-[#14532D] focus:outline-none"
          />
        </div>
      </div>

      {regError && (
        <p className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs font-medium text-[#B91C1C]">
          {regError}
        </p>
      )}

      <button
        type="submit"
        disabled={regBusy}
        className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534] disabled:opacity-60"
      >
        <UserPlus className="h-4 w-4" />
        <span>{regBusy ? 'Mendaftarkan...' : 'Daftar Pelanggan'}</span>
      </button>
    </form>
  );

  if (layout === 'tabs') {
    return (
      <div>
        <div className="mb-4 flex gap-1 rounded-lg bg-[#F3F1EC] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`min-h-[38px] flex-1 cursor-pointer rounded-md text-xs font-semibold ${
              activeTab === 'login' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E]'
            }`}
          >
            Login Akun
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`min-h-[38px] flex-1 cursor-pointer rounded-md text-xs font-semibold ${
              activeTab === 'register' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E]'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="rounded-2xl border border-[#E6E4DF] bg-white p-6 lg:col-span-5">
        {renderLoginForm()}
      </div>
      <div className="rounded-2xl border border-[#E6E4DF] bg-white p-6 lg:col-span-7">
        {renderRegisterForm()}
      </div>
    </div>
  );
}
