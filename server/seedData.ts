import type { KategoriMenu, MenuItem, Warkop } from '../src/types';

const FOTO_KOPI_HITAM_PANAS = '/src/assets/images/menu_kopi_hitam_1795591762549.jpg';
const FOTO_KOPI_HITAM_DINGIN = '/src/assets/images/es_kopi_hitam_1795591957707.jpg';
const FOTO_KOPI_SUSU_PANAS = '/src/assets/images/kopi_susu_panas_1795591957639.jpg';
const FOTO_KOPI_SUSU_DINGIN = '/src/assets/images/menu_kopi_susu_1795591763389.jpg';

const FOTO_TEH_TARIK = '/src/assets/images/teh_tarik_tunggal_1795592095593.jpg';
const FOTO_TEH_LEMON = '/src/assets/images/teh_lemon_1795591958432.jpg';
const FOTO_TEH_LECI = '/src/assets/images/teh_leci_1795591958656.jpg';
const FOTO_TEH_MANIS = '/src/assets/images/teh_manis_1795591958696.jpg';
const FOTO_WEDANG_UWUH = '/src/assets/images/wedang_uwuh_1795591959371.jpg';

const FOTO_SUSU_JAHE = '/src/assets/images/susu_jahe_1795591960215.jpg';
const FOTO_MILO_DINO = '/src/assets/images/milo_dino_1795591960518.jpg';
const FOTO_CINCAU_AREN = '/src/assets/images/cincau_aren_1795591960464.jpg';

const FOTO_JERUK_MANIS = '/src/assets/images/jeruk_manis_1795591961215.jpg';
const FOTO_JERUK_KUNCI = '/src/assets/images/jeruk_kunci_1795591961574.jpg';
const FOTO_SODA_SUSU = '/src/assets/images/soda_susu_1795592092299.jpg';
const FOTO_ES_BADAK = '/src/assets/images/es_badak_1795591962297.jpg';
const FOTO_AIR_MINERAL = '/src/assets/images/air_mineral_1795591962987.jpg';

const FOTO_TELUR_SETENGAH = '/src/assets/images/telur_setengah_matang_1795592092166.jpg';
const FOTO_SINGKONG_GORENG = '/src/assets/images/singkong_goreng_1795592092993.jpg';
const FOTO_CIRENG_AYAM = '/src/assets/images/cireng_ayam_1795592092856.jpg';
const FOTO_KENTANG_GORENG = '/src/assets/images/kentang_goreng_1795592093259.jpg';
const FOTO_PISANG_GORENG = '/src/assets/images/pisang_goreng_1795591964879.jpg';

const FOTO_ROTI_PANGGANG = '/src/assets/images/roti_panggang_1795592095231.jpg';
const FOTO_ROTI_KUKUS = '/src/assets/images/roti_kukus_1795592045815.jpg';

const FOTO_NASI_GORENG = '/src/assets/images/nasi_goreng_1795592094330.jpg';
const FOTO_KWETIAU_GORENG = '/src/assets/images/kwetiau_goreng_1795592046625.jpg';
const FOTO_INDOMIE_GORENG = '/src/assets/images/menu_indomie_warkop_1795591768072.jpg';
const FOTO_INDOMIE_KUAH = '/src/assets/images/indomie_kuah_1795592094832.jpg';

// Data resmi sesuai dump SQL sejati_maps (hanya data master katalog & usaha kuliner; tanpa data transaksi palsu)
export const INITIAL_KATEGORI: KategoriMenu[] = [
  { id: 1, nama_kategori: 'Kopi Sejati' },
  { id: 2, nama_kategori: 'Teh' },
  { id: 3, nama_kategori: 'Susu' },
  { id: 4, nama_kategori: 'Jeruk & Soda' },
  { id: 5, nama_kategori: 'Camilan' },
  { id: 6, nama_kategori: 'Roti Panggang & Kukus' },
  { id: 7, nama_kategori: 'Makanan' },
  { id: 8, nama_kategori: 'Indomie' },
];

export const INITIAL_MENU: Omit<MenuItem, 'nama_kategori'>[] = [
  { id: 1, kategori_id: 1, nama_menu: 'Kopi Hitam Panas', deskripsi: 'Kopi hitam panas', harga: 10000, foto: FOTO_KOPI_HITAM_PANAS, status: 'tersedia' },
  { id: 2, kategori_id: 1, nama_menu: 'Kopi Hitam Dingin', deskripsi: 'Kopi hitam dingin', harga: 10000, foto: FOTO_KOPI_HITAM_DINGIN, status: 'tersedia' },
  { id: 3, kategori_id: 1, nama_menu: 'Kopi Susu Panas', deskripsi: 'Kopi susu panas', harga: 12000, foto: FOTO_KOPI_SUSU_PANAS, status: 'tersedia' },
  { id: 4, kategori_id: 1, nama_menu: 'Kopi Susu Dingin', deskripsi: 'Kopi susu dingin', harga: 14000, foto: FOTO_KOPI_SUSU_DINGIN, status: 'tersedia' },
  { id: 5, kategori_id: 1, nama_menu: 'Kopi Tarik Panas', deskripsi: 'Kopi tarik panas', harga: 13000, foto: FOTO_KOPI_SUSU_PANAS, status: 'tersedia' },
  { id: 6, kategori_id: 1, nama_menu: 'Kopi Tarik Dingin', deskripsi: 'Kopi tarik dingin', harga: 15000, foto: FOTO_KOPI_SUSU_DINGIN, status: 'tersedia' },
  { id: 7, kategori_id: 1, nama_menu: 'Kopi Susu Aren Panas', deskripsi: 'Kopi susu aren panas', harga: 13000, foto: FOTO_KOPI_SUSU_PANAS, status: 'tersedia' },
  { id: 8, kategori_id: 1, nama_menu: 'Kopi Susu Aren Dingin', deskripsi: 'Kopi susu aren dingin', harga: 15000, foto: FOTO_KOPI_SUSU_DINGIN, status: 'tersedia' },
  { id: 9, kategori_id: 1, nama_menu: 'Es Kopi Balok', deskripsi: 'Es kopi balok', harga: 15000, foto: FOTO_KOPI_SUSU_DINGIN, status: 'tersedia' },
  { id: 10, kategori_id: 2, nama_menu: 'Teh Tarik Sejati Panas', deskripsi: 'Teh tarik panas', harga: 12000, foto: FOTO_TEH_TARIK, status: 'tersedia' },
  { id: 11, kategori_id: 2, nama_menu: 'Teh Tarik Sejati Dingin', deskripsi: 'Teh tarik dingin', harga: 15000, foto: FOTO_TEH_TARIK, status: 'tersedia' },
  { id: 12, kategori_id: 2, nama_menu: 'Teh Lemon Panas', deskripsi: 'Teh lemon panas', harga: 10000, foto: FOTO_TEH_LEMON, status: 'tersedia' },
  { id: 13, kategori_id: 2, nama_menu: 'Teh Lemon Dingin', deskripsi: 'Teh lemon dingin', harga: 12000, foto: FOTO_TEH_LEMON, status: 'tersedia' },
  { id: 14, kategori_id: 2, nama_menu: 'Teh Leci Panas', deskripsi: 'Teh leci panas', harga: 12000, foto: FOTO_TEH_LECI, status: 'tersedia' },
  { id: 15, kategori_id: 2, nama_menu: 'Teh Leci Dingin', deskripsi: 'Teh leci dingin', harga: 14000, foto: FOTO_TEH_LECI, status: 'tersedia' },
  { id: 16, kategori_id: 2, nama_menu: 'Teh Manis Panas', deskripsi: 'Teh manis panas', harga: 6000, foto: FOTO_TEH_MANIS, status: 'tersedia' },
  { id: 17, kategori_id: 2, nama_menu: 'Teh Manis Dingin', deskripsi: 'Teh manis dingin', harga: 7000, foto: FOTO_TEH_MANIS, status: 'tersedia' },
  { id: 18, kategori_id: 2, nama_menu: 'Wedang Uwuh', deskripsi: 'Wedang uwuh panas', harga: 10000, foto: FOTO_WEDANG_UWUH, status: 'tersedia' },
  { id: 19, kategori_id: 3, nama_menu: 'Susu Panas', deskripsi: 'Susu panas', harga: 8000, foto: FOTO_SUSU_JAHE, status: 'tersedia' },
  { id: 20, kategori_id: 3, nama_menu: 'Susu Dingin', deskripsi: 'Susu dingin', harga: 10000, foto: FOTO_SUSU_JAHE, status: 'tersedia' },
  { id: 21, kategori_id: 3, nama_menu: 'Susu Jahe', deskripsi: 'Susu jahe panas', harga: 8000, foto: FOTO_SUSU_JAHE, status: 'tersedia' },
  { id: 22, kategori_id: 3, nama_menu: 'Milo Dino Panas', deskripsi: 'Milo dino panas', harga: 14000, foto: FOTO_MILO_DINO, status: 'tersedia' },
  { id: 23, kategori_id: 3, nama_menu: 'Milo Dino Dingin', deskripsi: 'Milo dino dingin', harga: 15000, foto: FOTO_MILO_DINO, status: 'tersedia' },
  { id: 24, kategori_id: 3, nama_menu: 'Cincau Gula Aren', deskripsi: 'Minuman cincau gula aren', harga: 15000, foto: FOTO_CINCAU_AREN, status: 'tersedia' },
  { id: 25, kategori_id: 4, nama_menu: 'Jeruk Manis Panas', deskripsi: 'Jeruk manis panas', harga: 9000, foto: FOTO_JERUK_MANIS, status: 'tersedia' },
  { id: 26, kategori_id: 4, nama_menu: 'Jeruk Manis Dingin', deskripsi: 'Jeruk manis dingin', harga: 10000, foto: FOTO_JERUK_MANIS, status: 'tersedia' },
  { id: 27, kategori_id: 4, nama_menu: 'Jeruk Sonmoy', deskripsi: 'Jeruk sonmoy', harga: 12000, foto: FOTO_JERUK_MANIS, status: 'tersedia' },
  { id: 28, kategori_id: 4, nama_menu: 'Jeruk Longan', deskripsi: 'Jeruk longan', harga: 15000, foto: FOTO_JERUK_MANIS, status: 'tersedia' },
  { id: 29, kategori_id: 4, nama_menu: 'Jeruk Kunci Panas', deskripsi: 'Jeruk kunci panas', harga: 9000, foto: FOTO_JERUK_KUNCI, status: 'tersedia' },
  { id: 30, kategori_id: 4, nama_menu: 'Jeruk Kunci Dingin', deskripsi: 'Jeruk kunci dingin', harga: 10000, foto: FOTO_JERUK_KUNCI, status: 'tersedia' },
  { id: 31, kategori_id: 4, nama_menu: 'Jeruk Kunci Sonmoy', deskripsi: 'Jeruk kunci sonmoy', harga: 12000, foto: FOTO_JERUK_KUNCI, status: 'tersedia' },
  { id: 32, kategori_id: 4, nama_menu: 'Calamansi Soda', deskripsi: 'Minuman calamansi soda', harga: 15000, foto: FOTO_JERUK_KUNCI, status: 'tersedia' },
  { id: 33, kategori_id: 4, nama_menu: 'Soda Susu', deskripsi: 'Minuman soda susu', harga: 12000, foto: FOTO_SODA_SUSU, status: 'tersedia' },
  { id: 34, kategori_id: 4, nama_menu: 'Extra Joss Susu', deskripsi: 'Minuman extra joss susu', harga: 10000, foto: FOTO_SODA_SUSU, status: 'tersedia' },
  { id: 35, kategori_id: 4, nama_menu: 'Es Badak', deskripsi: 'Minuman es badak', harga: 20000, foto: FOTO_ES_BADAK, status: 'tersedia' },
  { id: 36, kategori_id: 4, nama_menu: 'Badak Float', deskripsi: 'Minuman badak float', harga: 25000, foto: FOTO_ES_BADAK, status: 'tersedia' },
  { id: 37, kategori_id: 4, nama_menu: 'Mineral', deskripsi: 'Air mineral', harga: 5000, foto: FOTO_AIR_MINERAL, status: 'tersedia' },
  { id: 38, kategori_id: 5, nama_menu: 'Telur 1/2 Matang', deskripsi: 'Telur setengah matang', harga: 12000, foto: FOTO_TELUR_SETENGAH, status: 'tersedia' },
  { id: 39, kategori_id: 5, nama_menu: 'Singkong Goreng', deskripsi: 'Singkong goreng', harga: 10000, foto: FOTO_SINGKONG_GORENG, status: 'tersedia' },
  { id: 40, kategori_id: 5, nama_menu: 'Cireng Ayam', deskripsi: 'Cireng isi ayam', harga: 15000, foto: FOTO_CIRENG_AYAM, status: 'tersedia' },
  { id: 41, kategori_id: 5, nama_menu: 'Kentang Goreng', deskripsi: 'Kentang goreng', harga: 15000, foto: FOTO_KENTANG_GORENG, status: 'tersedia' },
  { id: 42, kategori_id: 5, nama_menu: 'Pisang Goreng Cokelat/Keju', deskripsi: 'Pisang goreng cokelat atau keju', harga: 12000, foto: FOTO_PISANG_GORENG, status: 'tersedia' },
  { id: 43, kategori_id: 5, nama_menu: 'Pisang Goreng Cokelat Keju', deskripsi: 'Pisang goreng cokelat keju', harga: 15000, foto: FOTO_PISANG_GORENG, status: 'tersedia' },
  { id: 44, kategori_id: 6, nama_menu: 'Roti Panggang Cokelat', deskripsi: 'Roti panggang cokelat', harga: 12000, foto: FOTO_ROTI_PANGGANG, status: 'tersedia' },
  { id: 45, kategori_id: 6, nama_menu: 'Roti Panggang Keju', deskripsi: 'Roti panggang keju', harga: 15000, foto: FOTO_ROTI_PANGGANG, status: 'tersedia' },
  { id: 46, kategori_id: 6, nama_menu: 'Roti Panggang Cokelat Keju', deskripsi: 'Roti panggang cokelat keju', harga: 18000, foto: FOTO_ROTI_PANGGANG, status: 'tersedia' },
  { id: 47, kategori_id: 6, nama_menu: 'Roti Panggang Mentega Gula', deskripsi: 'Roti panggang mentega gula', harga: 10000, foto: FOTO_ROTI_PANGGANG, status: 'tersedia' },
  { id: 48, kategori_id: 6, nama_menu: 'Roti Kukus Cokelat', deskripsi: 'Roti kukus cokelat', harga: 10000, foto: FOTO_ROTI_KUKUS, status: 'tersedia' },
  { id: 49, kategori_id: 6, nama_menu: 'Roti Kukus Keju', deskripsi: 'Roti kukus keju', harga: 10000, foto: FOTO_ROTI_KUKUS, status: 'tersedia' },
  { id: 50, kategori_id: 6, nama_menu: 'Roti Kukus Mentega Gula', deskripsi: 'Roti kukus mentega gula', harga: 10000, foto: FOTO_ROTI_KUKUS, status: 'tersedia' },
  { id: 51, kategori_id: 7, nama_menu: 'Nasi Goreng Kampung', deskripsi: 'Nasi goreng kampung', harga: 17000, foto: FOTO_NASI_GORENG, status: 'tersedia' },
  { id: 52, kategori_id: 7, nama_menu: 'Kwetiau Goreng', deskripsi: 'Kwetiau goreng', harga: 17000, foto: FOTO_KWETIAU_GORENG, status: 'tersedia' },
  { id: 53, kategori_id: 7, nama_menu: 'Mie Nyemek', deskripsi: 'Mie nyemek', harga: 17000, foto: FOTO_INDOMIE_GORENG, status: 'tersedia' },
  { id: 54, kategori_id: 8, nama_menu: 'Mie Goreng Single', deskripsi: 'Indomie goreng single', harga: 8000, foto: FOTO_INDOMIE_GORENG, status: 'tersedia' },
  { id: 55, kategori_id: 8, nama_menu: 'Mie Goreng Double', deskripsi: 'Indomie goreng double', harga: 12000, foto: FOTO_INDOMIE_GORENG, status: 'tersedia' },
  { id: 56, kategori_id: 8, nama_menu: 'Mie Jumbo', deskripsi: 'Indomie jumbo', harga: 10000, foto: FOTO_INDOMIE_GORENG, status: 'tersedia' },
  { id: 57, kategori_id: 8, nama_menu: 'Mie Soto Single', deskripsi: 'Indomie soto single', harga: 8000, foto: FOTO_INDOMIE_KUAH, status: 'tersedia' },
  { id: 58, kategori_id: 8, nama_menu: 'Mie Soto Double', deskripsi: 'Indomie soto double', harga: 12000, foto: FOTO_INDOMIE_KUAH, status: 'tersedia' },
  { id: 59, kategori_id: 8, nama_menu: 'Mie Kari Single', deskripsi: 'Indomie kari single', harga: 8000, foto: FOTO_INDOMIE_KUAH, status: 'tersedia' },
  { id: 60, kategori_id: 8, nama_menu: 'Mie Kari Double', deskripsi: 'Indomie kari double', harga: 12000, foto: FOTO_INDOMIE_KUAH, status: 'tersedia' },
];

export const INITIAL_WARKOP: Warkop[] = [
  {
    id: 1,
    nama: 'WARKOP SEJATI',
    alamat: 'Jalan Pasar Mambo, Kelurahan Masjid Jamik, Kecamatan Rangkui, Pangkalpinang',
    latitude: -2.1301668,
    longitude: 106.1125737,
    deskripsi: 'Warkop Sejati menyediakan makanan dan minuman serta layanan pemesanan online dan reservasi',
    telepon: null,
  },
];
