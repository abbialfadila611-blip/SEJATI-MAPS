import { useCallback, useEffect, useState } from 'react';
import { AdminPanelView } from './components/AdminPanelView';
import { CartDrawer } from './components/CartDrawer';
import { CatalogView } from './components/CatalogView';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { HistoryAndReservationView } from './components/HistoryAndReservationView';
import { HomeView } from './components/HomeView';
import { MapExplorerView } from './components/MapExplorerView';
import { MenuDetailModal } from './components/MenuDetailModal';
import { Navbar, type AppRoute } from './components/Navbar';
import { api } from './services/api';
import { detectCurrentPosition } from './services/geolocation';
import type {
  AdminUser,
  CartItem,
  GeoValidationResult,
  KategoriMenu,
  MenuItem,
  Pelanggan,
  Warkop,
} from './types';

export default function App() {
  const [route, setRoute] = useState<AppRoute>('beranda');

  const [kategoriList, setKategoriList] = useState<KategoriMenu[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [warkopList, setWarkopList] = useState<Warkop[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [detailMenu, setDetailMenu] = useState<MenuItem | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartToast, setCartToast] = useState<string | null>(null);

  // Token autentikasi disimpan hanya di memori React (bukan localStorage)
  const [customer, setCustomer] = useState<Pelanggan | null>(null);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const [customerPosition, setCustomerPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [geoResult, setGeoResult] = useState<GeoValidationResult | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    try {
      setCatalogError(null);
      const data = await api.getCatalog();
      setKategoriList(data.kategori);
      setMenuList(data.menu);
      setWarkopList(data.warkop);
    } catch (err) {
      setCatalogError(
        err instanceof Error ? err.message : 'Gagal memuat katalog dari server.'
      );
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const validateAndSetCoordinate = useCallback(async (lat: number, lng: number) => {
    setCustomerPosition({ latitude: lat, longitude: lng });
    try {
      const result = await api.validateGeo(lat, lng);
      setGeoResult(result);
    } catch (err) {
      setGpsError(
        err instanceof Error ? err.message : 'Gagal memvalidasi koordinat di server.'
      );
    }
  }, []);

  const handleDetectGps = useCallback(async () => {
    setGpsError(null);
    setGpsLoading(true);
    try {
      const pos = await detectCurrentPosition();
      await validateAndSetCoordinate(pos.latitude, pos.longitude);
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : 'Deteksi GPS gagal.');
    } finally {
      setGpsLoading(false);
    }
  }, [validateAndSetCoordinate]);

  const handleAddToCart = (item: MenuItem, qty = 1) => {
    if (item.status !== 'tersedia') return;
    setCart((prev) => {
      const existing = prev.find((c) => c.menu.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menu.id === item.id ? { ...c, jumlah: c.jumlah + qty } : c
        );
      }
      return [...prev, { menu: item, jumlah: qty }];
    });
    setCartToast(`${item.nama_menu} ditambahkan ke keranjang.`);
    window.setTimeout(() => {
      setCartToast((curr) =>
        curr === `${item.nama_menu} ditambahkan ke keranjang.` ? null : curr
      );
    }, 2400);
  };

  const handleUpdateCartQty = (menuId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.menu.id === menuId ? { ...c, jumlah: c.jumlah + delta } : c))
        .filter((c) => c.jumlah > 0)
    );
  };

  const handleRemoveCartItem = (menuId: number) => {
    setCart((prev) => prev.filter((c) => c.menu.id !== menuId));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Navbar
        activeRoute={route}
        onNavigate={(nextRoute) => {
          setRoute(nextRoute);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        customer={customer}
        onOpenCustomerAuth={() => setAuthModalOpen(true)}
        onCustomerLogout={() => {
          setCustomer(null);
          setCustomerToken(null);
        }}
        admin={admin}
      />

      {cartToast && (
        <div
          role="status"
          className="fixed right-4 bottom-5 z-40 rounded-xl border border-[#14532D]/20 bg-[#1C1917] px-4 py-3 text-xs font-medium text-white shadow-lg"
        >
          {cartToast}
        </div>
      )}

      <main className="flex-1">
        {catalogLoading ? (
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-[#57534E]">
            Memuat data katalog SEJATI MAPS...
          </div>
        ) : catalogError ? (
          <div className="mx-auto max-w-xl px-4 py-16 text-center">
            <div className="rounded-xl border border-[#FECACA] bg-white p-6">
              <p className="text-base font-semibold text-[#B91C1C]">
                Gagal Menghubungkan ke Server
              </p>
              <p className="mt-2 text-sm text-[#57534E]">{catalogError}</p>
              <button
                type="button"
                onClick={loadCatalog}
                className="mt-4 min-h-[40px] cursor-pointer rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <>
            {route === 'beranda' && (
              <HomeView
                kategoriList={kategoriList}
                menuList={menuList}
                warkopList={warkopList}
                customer={customer}
                customerPosition={customerPosition}
                geoResult={geoResult}
                gpsLoading={gpsLoading}
                onDetectGps={handleDetectGps}
                onOpenCustomerAuth={() => setAuthModalOpen(true)}
                onNavigate={setRoute}
                onSelectCategory={(katId) => {
                  setSelectedCategoryId(katId);
                  setRoute('katalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectMenu={setDetailMenu}
                onAddToCart={(item) => handleAddToCart(item, 1)}
              />
            )}

            {route === 'katalog' && (
              <CatalogView
                kategoriList={kategoriList}
                menuList={menuList}
                selectedCategoryId={selectedCategoryId}
                onSelectCategoryId={setSelectedCategoryId}
                onSelectMenu={setDetailMenu}
                onAddToCart={(item) => handleAddToCart(item, 1)}
              />
            )}

            {route === 'peta' && (
              <MapExplorerView
                warkopList={warkopList}
                customerPosition={customerPosition}
                geoResult={geoResult}
                gpsLoading={gpsLoading}
                gpsError={gpsError}
                onDetectGps={handleDetectGps}
                onSetManualCoordinate={validateAndSetCoordinate}
              />
            )}

            {(route === 'riwayat' || route === 'reservasi') && (
              <HistoryAndReservationView
                mode={route}
                customer={customer}
                customerToken={customerToken}
                activeAdmin={admin}
                onCustomerAuthenticated={(c, t) => {
                  setCustomer(c);
                  setCustomerToken(t);
                }}
                onAdminAuthenticated={(a, t) => {
                  setAdmin(a);
                  setAdminToken(t);
                  setRoute('admin');
                }}
                onOpenAdminPanel={() => setRoute('admin')}
                onCustomerLogout={() => {
                  setCustomer(null);
                  setCustomerToken(null);
                }}
                onSwitchMode={(m) => setRoute(m)}
              />
            )}

            {route === 'admin' && (
              <AdminPanelView
                admin={admin}
                adminToken={adminToken}
                onAdminAuthenticated={(a, t) => {
                  setAdmin(a);
                  setAdminToken(t);
                }}
                onAdminLogout={() => {
                  setAdmin(null);
                  setAdminToken(null);
                }}
                onOpenCustomerLogin={() => setAuthModalOpen(true)}
                kategoriList={kategoriList}
                menuList={menuList}
                warkopList={warkopList}
                onRefreshCatalog={loadCatalog}
              />
            )}
          </>
        )}
      </main>

      <footer className="mt-16 border-t border-[#E6E4DF] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-6 text-xs text-[#57534E] sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="font-semibold text-[#1C1917]">
              SEJATI MAPS · Sistem Informasi Geografis &amp; Pemesanan Kuliner
            </p>
            <p className="mt-0.5">
              Wilayah layanan: Kota Pangkal Pinang, Kepulauan Bangka Belitung
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setRoute('katalog')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Katalog Menu
            </button>
            <button
              type="button"
              onClick={() => setRoute('peta')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Peta Pangkal Pinang
            </button>
            <button
              type="button"
              onClick={() => setRoute('reservasi')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Reservasi Meja
            </button>
            <button
              type="button"
              onClick={() => setRoute('admin')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Panel Admin
            </button>
          </div>
        </div>
      </footer>

      <MenuDetailModal
        item={detailMenu}
        onClose={() => setDetailMenu(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        customer={customer}
        customerToken={customerToken}
        activeAdmin={admin}
        onCustomerAuthenticated={(c, t) => {
          setCustomer(c);
          setCustomerToken(t);
        }}
        onAdminAuthenticated={(a, t) => {
          setAdmin(a);
          setAdminToken(t);
          setCartOpen(false);
          setRoute('admin');
        }}
        onOpenAdminPanel={() => {
          setCartOpen(false);
          setRoute('admin');
        }}
        customerPosition={customerPosition}
        geoResult={geoResult}
        gpsLoading={gpsLoading}
        onDetectGps={handleDetectGps}
        onOrderSuccess={() => {
          // Segarkan bila pengguna sedang berada di halaman riwayat
        }}
      />

      <CustomerAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        activeAdmin={admin}
        onAuthenticated={(c, t) => {
          setCustomer(c);
          setCustomerToken(t);
        }}
        onAdminAuthenticated={(a, t) => {
          setAdmin(a);
          setAdminToken(t);
          setRoute('admin');
        }}
        onOpenAdminPanel={() => setRoute('admin')}
      />
    </div>
  );
}
