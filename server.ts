import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import type {
  DetailPesanan,
  KategoriMenu,
  MenuItem,
  Pelanggan,
  Pembayaran,
  Pesanan,
  Reservasi,
  Warkop,
} from './src/types';
import {
  estimateDistrict,
  haversineDistanceKm,
  isPointInPangkalPinang,
} from './src/utils/geoPangkalPinang';
import { INITIAL_KATEGORI, INITIAL_MENU, INITIAL_WARKOP } from './server/seedData';

dotenv.config();

const PORT = 3000;
const AUTH_SECRET = process.env.APP_AUTH_SECRET || crypto.randomBytes(32).toString('hex');

interface AdminRecord {
  id: number;
  nama: string;
  username: string;
  passwordHash: string;
}

interface TokenClaims {
  role: 'pelanggan' | 'admin';
  sub: number;
  exp: number;
}

// State pratinjau di memori (hanya berisi data katalog SQL resmi; transaksi dimulai kosong)
const db = {
  kategori: structuredClone(INITIAL_KATEGORI) as KategoriMenu[],
  menu: INITIAL_MENU.map((m) => ({ ...m })) as Omit<MenuItem, 'nama_kategori'>[],
  warkop: structuredClone(INITIAL_WARKOP) as Warkop[],
  pelanggan: [] as Pelanggan[],
  admin: [] as AdminRecord[],
  pesanan: [] as Omit<Pesanan, 'items' | 'pembayaran' | 'pelanggan_nama' | 'pelanggan_telepon'>[],
  detail_pesanan: [] as DetailPesanan[],
  pembayaran: [] as Pembayaran[],
  reservasi: [] as Reservasi[],
  nextId: {
    kategori: 9,
    menu: 61,
    warkop: 2,
    pelanggan: 1,
    admin: 1,
    pesanan: 1,
    detail_pesanan: 1,
    pembayaran: 1,
    reservasi: 1,
  },
};

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input: string): string {
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return Buffer.from(b64, 'base64').toString('utf8');
}

function issueToken(claims: Omit<TokenClaims, 'exp'>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({ ...claims, exp: Math.floor(Date.now() / 1000) + 86400 })
  );
  const sig = base64UrlEncode(
    crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${payload}`).digest()
  );
  return `${header}.${payload}.${sig}`;
}

function verifyToken(token: string | undefined): TokenClaims | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expected = base64UrlEncode(
    crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${payload}`).digest()
  );
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as TokenClaims;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function requireRole(role: 'pelanggan' | 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || '';
    const match = /^Bearer\s+(\S+)$/i.exec(authHeader);
    const claims = verifyToken(match?.[1]);
    if (!claims || claims.role !== role) {
      res.status(401).json({
        success: false,
        message:
          role === 'admin'
            ? 'Akses admin ditolak. Silakan login sebagai admin.'
            : 'Sesi pelanggan tidak valid. Silakan login terlebih dahulu.',
      });
      return;
    }
    (req as Request & { authClaims?: TokenClaims }).authClaims = claims;
    next();
  };
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/[^0-9+]/g, '');
}

function enrichMenu(): MenuItem[] {
  const catMap = new Map(db.kategori.map((k) => [k.id, k.nama_kategori]));
  return db.menu.map((m) => ({
    ...m,
    nama_kategori: m.kategori_id ? catMap.get(m.kategori_id) : undefined,
  }));
}

function enrichOrder(order: (typeof db.pesanan)[number]): Pesanan {
  const customer = db.pelanggan.find((p) => p.id === order.pelanggan_id);
  const items = db.detail_pesanan
    .filter((d) => d.pesanan_id === order.id)
    .map((d) => ({
      ...d,
      nama_menu: db.menu.find((m) => m.id === d.menu_id)?.nama_menu,
    }));
  const pembayaran = db.pembayaran.find((p) => p.pesanan_id === order.id) || null;
  return {
    ...order,
    pelanggan_nama: customer?.nama,
    pelanggan_telepon: customer?.telepon,
    items,
    pembayaran,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Katalog Publik
  app.get('/api/catalog', (_req, res) => {
    res.json({
      success: true,
      mode: 'preview_bridge',
      kategori: db.kategori,
      menu: enrichMenu(),
      warkop: db.warkop,
    });
  });

  // 2. Validasi Geospasial Wilayah Pangkal Pinang
  app.get('/api/geo/validate', (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(400).json({ success: false, message: 'Parameter lat dan lng wajib valid.' });
      return;
    }
    const valid = isPointInPangkalPinang(lat, lng);
    const kecamatan = estimateDistrict(lat, lng);

    let nearest: { id: number; nama: string; distance_km: number } | null = null;
    let bestDist = Infinity;
    for (const w of db.warkop) {
      if (w.latitude !== null && w.longitude !== null) {
        const dist = haversineDistanceKm(lat, lng, w.latitude, w.longitude);
        if (dist < bestDist) {
          bestDist = dist;
          nearest = { id: w.id, nama: w.nama, distance_km: dist };
        }
      }
    }

    res.json({
      success: true,
      valid,
      latitude: lat,
      longitude: lng,
      region: 'Kota Pangkal Pinang',
      kecamatan_estimasi: kecamatan,
      message: valid
        ? `Lokasi Anda berada dalam wilayah layanan Kota Pangkal Pinang (${kecamatan ?? 'Pangkal Pinang'}).`
        : 'Lokasi Anda berada di luar batas wilayah layanan administratif Kota Pangkal Pinang.',
      nearest_warkop: nearest,
    });
  });

  // 3. Autentikasi Pelanggan
  const customerPasswords = new Map<number, string>();

  app.post('/api/auth/customer/register', (req, res) => {
    const nama = String(req.body?.nama ?? '').trim();
    const telepon = normalizePhone(String(req.body?.telepon ?? ''));
    const email = String(req.body?.email ?? '').trim() || null;
    const alamat = String(req.body?.alamat ?? '').trim() || null;
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');

    if (!nama || telepon.length < 8) {
      res.status(422).json({
        success: false,
        message: 'Nama lengkap dan nomor telepon (min. 8 digit) wajib diisi.',
      });
      return;
    }

    if (username.length < 3 || !/^[a-zA-Z0-9._-]+$/.test(username)) {
      res.status(422).json({
        success: false,
        message: 'Username minimal 3 karakter (huruf, angka, titik, atau garis bawah).',
      });
      return;
    }

    if (password.length < 6) {
      res.status(422).json({
        success: false,
        message: 'Password minimal 6 karakter.',
      });
      return;
    }

    if (db.pelanggan.some((p) => p.telepon === telepon)) {
      res.status(409).json({
        success: false,
        message: 'Nomor telepon sudah terdaftar. Silakan gunakan kolom Login.',
      });
      return;
    }

    if (db.pelanggan.some((p) => p.username?.toLowerCase() === username.toLowerCase())) {
      res.status(409).json({
        success: false,
        message: 'Username sudah digunakan pelanggan lain.',
      });
      return;
    }

    const pelanggan: Pelanggan = {
      id: db.nextId.pelanggan++,
      nama,
      telepon,
      email,
      alamat,
      username,
    };
    db.pelanggan.push(pelanggan);
    customerPasswords.set(pelanggan.id, hashPassword(password));
    const token = issueToken({ role: 'pelanggan', sub: pelanggan.id });
    res.status(201).json({ success: true, pelanggan, token });
  });

  app.post('/api/auth/customer/login', (req, res) => {
    const identifier = String(
      req.body?.identifier ?? req.body?.username ?? req.body?.telepon ?? ''
    ).trim();
    const password = String(req.body?.password ?? '');
    const normalizedPhone = normalizePhone(identifier);

    if (!identifier || !password) {
      res.status(422).json({
        success: false,
        message: 'Username atau nomor telepon dan password wajib diisi.',
      });
      return;
    }

    const customer = db.pelanggan.find(
      (p) =>
        p.username?.toLowerCase() === identifier.toLowerCase() ||
        p.telepon === normalizedPhone ||
        (p.email && p.email.toLowerCase() === identifier.toLowerCase())
    );
    const storedHash = customer ? customerPasswords.get(customer.id) : undefined;

    if (!customer || !storedHash || !verifyPassword(password, storedHash)) {
      res.status(401).json({
        success: false,
        message: 'Username/telepon atau password salah.',
      });
      return;
    }
    const token = issueToken({ role: 'pelanggan', sub: customer.id });
    res.json({ success: true, pelanggan: customer, token });
  });

  // 4. Autentikasi Admin
  app.get('/api/auth/admin/status', (_req, res) => {
    res.json({ success: true, has_admin: db.admin.length > 0 });
  });

  app.post('/api/auth/admin/setup', (req, res) => {
    if (db.admin.length > 0) {
      res.status(403).json({
        success: false,
        message: 'Akun admin sudah terdaftar. Silakan login.',
      });
      return;
    }
    const nama = String(req.body?.nama ?? '').trim();
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');
    if (!nama || username.length < 3 || password.length < 6) {
      res.status(422).json({
        success: false,
        message: 'Nama, username (min. 3 karakter), dan password (min. 6 karakter) wajib diisi.',
      });
      return;
    }
    const adminRec: AdminRecord = {
      id: db.nextId.admin++,
      nama,
      username,
      passwordHash: hashPassword(password),
    };
    db.admin.push(adminRec);
    const token = issueToken({ role: 'admin', sub: adminRec.id });
    res.status(201).json({
      success: true,
      admin: { id: adminRec.id, nama: adminRec.nama, username: adminRec.username },
      token,
    });
  });

  app.post('/api/auth/admin/login', (req, res) => {
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');
    const adminRec = db.admin.find((a) => a.username === username);
    if (!adminRec || !verifyPassword(password, adminRec.passwordHash)) {
      res.status(401).json({
        success: false,
        message: 'Username atau password admin salah.',
      });
      return;
    }
    const token = issueToken({ role: 'admin', sub: adminRec.id });
    res.json({
      success: true,
      admin: { id: adminRec.id, nama: adminRec.nama, username: adminRec.username },
      token,
    });
  });

  // 5. Checkout & Riwayat Pelanggan (dengan validasi geospasial backend!)
  app.post('/api/orders/checkout', requireRole('pelanggan'), (req, res) => {
    const claims = (req as Request & { authClaims: TokenClaims }).authClaims;
    const lat = Number(req.body?.latitude);
    const lng = Number(req.body?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(422).json({
        success: false,
        message: 'Koordinat GPS pelanggan wajib dikirim untuk verifikasi wilayah Kota Pangkal Pinang.',
      });
      return;
    }

    if (!isPointInPangkalPinang(lat, lng)) {
      res.status(403).json({
        success: false,
        code: 'OUT_OF_SERVICE_AREA',
        message:
          'Checkout ditolak oleh server: Lokasi GPS Anda berada di luar wilayah administratif Kota Pangkal Pinang.',
      });
      return;
    }

    const jenisPesanan = req.body?.jenis_pesanan === 'dine_in' ? 'dine_in' : 'takeaway';
    const metodePembayaran = String(req.body?.metode_pembayaran ?? 'Tunai').trim() || 'Tunai';
    const itemsInput = Array.isArray(req.body?.items) ? req.body.items : [];

    if (itemsInput.length === 0) {
      res.status(422).json({ success: false, message: 'Keranjang pesanan kosong.' });
      return;
    }

    const resolvedLines: Omit<DetailPesanan, 'id' | 'pesanan_id'>[] = [];
    let total = 0;

    for (const item of itemsInput) {
      const menuId = Number(item?.menu_id);
      const jumlah = Number(item?.jumlah);
      if (!Number.isInteger(menuId) || !Number.isInteger(jumlah) || jumlah <= 0) {
        res.status(400).json({ success: false, message: 'Item pesanan tidak valid.' });
        return;
      }
      const menuRow = db.menu.find((m) => m.id === menuId);
      if (!menuRow) {
        res.status(404).json({ success: false, message: `Menu ID ${menuId} tidak ditemukan.` });
        return;
      }
      if (menuRow.status !== 'tersedia') {
        res.status(400).json({
          success: false,
          message: `Menu ${menuRow.nama_menu} sedang habis.`,
        });
        return;
      }
      const subtotal = menuRow.harga * jumlah;
      total += subtotal;
      resolvedLines.push({
        menu_id: menuId,
        nama_menu: menuRow.nama_menu,
        jumlah,
        harga: menuRow.harga,
        subtotal,
      });
    }

    const pesananId = db.nextId.pesanan++;
    const kodePesanan = `SJT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;

    const orderRow = {
      id: pesananId,
      pelanggan_id: claims.sub,
      kode_pesanan: kodePesanan,
      jenis_pesanan: jenisPesanan as 'dine_in' | 'takeaway',
      total,
      status: 'menunggu' as const,
      tanggal_pesanan: new Date().toISOString(),
    };
    db.pesanan.unshift(orderRow);

    for (const line of resolvedLines) {
      db.detail_pesanan.push({
        id: db.nextId.detail_pesanan++,
        pesanan_id: pesananId,
        menu_id: line.menu_id,
        jumlah: line.jumlah,
        harga: line.harga,
        subtotal: line.subtotal,
      });
    }

    const payStatus =
      metodePembayaran.toLowerCase() === 'tunai' ? 'belum_bayar' : 'menunggu_verifikasi';
    db.pembayaran.push({
      id: db.nextId.pembayaran++,
      pesanan_id: pesananId,
      metode: metodePembayaran,
      jumlah_bayar: total,
      status: payStatus,
      tanggal_bayar: null,
    });

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat di wilayah layanan Kota Pangkal Pinang.',
      pesanan: enrichOrder(orderRow),
    });
  });

  app.get('/api/orders/my', requireRole('pelanggan'), (req, res) => {
    const claims = (req as Request & { authClaims: TokenClaims }).authClaims;
    const orders = db.pesanan
      .filter((p) => p.pelanggan_id === claims.sub)
      .map(enrichOrder);
    res.json({ success: true, orders });
  });

  // 6. Reservasi Meja
  app.get('/api/reservations/my', requireRole('pelanggan'), (req, res) => {
    const claims = (req as Request & { authClaims: TokenClaims }).authClaims;
    const reservations = db.reservasi.filter((r) => r.pelanggan_id === claims.sub);
    res.json({ success: true, reservations });
  });

  app.post('/api/reservations', requireRole('pelanggan'), (req, res) => {
    const claims = (req as Request & { authClaims: TokenClaims }).authClaims;
    const tanggal = String(req.body?.tanggal ?? '').trim();
    const jam = String(req.body?.jam ?? '').trim();
    const jumlah_orang = Number(req.body?.jumlah_orang);
    const catatan = String(req.body?.catatan ?? '').trim() || null;

    if (!tanggal || !jam || !Number.isInteger(jumlah_orang) || jumlah_orang < 1) {
      res.status(422).json({
        success: false,
        message: 'Tanggal, jam, dan jumlah orang wajib diisi.',
      });
      return;
    }

    const reservation: Reservasi = {
      id: db.nextId.reservasi++,
      pelanggan_id: claims.sub,
      tanggal,
      jam,
      jumlah_orang,
      catatan,
      status: 'menunggu',
    };
    db.reservasi.unshift(reservation);
    res.status(201).json({ success: true, reservation });
  });

  // 7. Panel Admin (semua 9 tabel)
  app.get('/api/admin/dashboard', requireRole('admin'), (_req, res) => {
    const totalPendapatan = db.pembayaran
      .filter((p) => p.status === 'lunas')
      .reduce((acc, p) => acc + p.jumlah_bayar, 0);

    res.json({
      success: true,
      stats: {
        total_pesanan: db.pesanan.length,
        pesanan_menunggu: db.pesanan.filter((p) => p.status === 'menunggu').length,
        pesanan_diproses: db.pesanan.filter((p) => p.status === 'diproses').length,
        pesanan_selesai: db.pesanan.filter((p) => p.status === 'selesai').length,
        total_pendapatan_lunas: totalPendapatan,
        total_menu: db.menu.length,
        menu_tersedia: db.menu.filter((m) => m.status === 'tersedia').length,
        total_kategori: db.kategori.length,
        total_pelanggan: db.pelanggan.length,
        total_warkop: db.warkop.length,
        total_reservasi: db.reservasi.length,
      },
    });
  });

  // Admin Kategori
  app.post('/api/admin/categories', requireRole('admin'), (req, res) => {
    const nama = String(req.body?.nama_kategori ?? '').trim();
    if (!nama) {
      res.status(422).json({ success: false, message: 'Nama kategori wajib diisi.' });
      return;
    }
    const id = db.nextId.kategori++;
    db.kategori.push({ id, nama_kategori: nama });
    res.status(201).json({ success: true, id });
  });

  app.put('/api/admin/categories', requireRole('admin'), (req, res) => {
    const id = Number(req.body?.id);
    const nama = String(req.body?.nama_kategori ?? '').trim();
    const row = db.kategori.find((k) => k.id === id);
    if (!row || !nama) {
      res.status(422).json({ success: false, message: 'ID dan nama kategori tidak valid.' });
      return;
    }
    row.nama_kategori = nama;
    res.json({ success: true });
  });

  app.delete('/api/admin/categories', requireRole('admin'), (req, res) => {
    const id = Number(req.query.id ?? req.body?.id);
    if (db.menu.some((m) => m.kategori_id === id)) {
      res.status(409).json({
        success: false,
        message: 'Kategori masih digunakan oleh data menu.',
      });
      return;
    }
    db.kategori = db.kategori.filter((k) => k.id !== id);
    res.json({ success: true });
  });

  // Admin Menu
  app.post('/api/admin/menu', requireRole('admin'), (req, res) => {
    const kategori_id = req.body?.kategori_id ? Number(req.body.kategori_id) : null;
    const nama_menu = String(req.body?.nama_menu ?? '').trim();
    const deskripsi = String(req.body?.deskripsi ?? '').trim() || null;
    const harga = Number(req.body?.harga);
    const foto = String(req.body?.foto ?? '').trim() || null;
    const status = req.body?.status === 'habis' ? 'habis' : 'tersedia';

    if (!nama_menu || !Number.isFinite(harga) || harga <= 0) {
      res.status(422).json({ success: false, message: 'Nama menu dan harga valid wajib diisi.' });
      return;
    }
    const id = db.nextId.menu++;
    db.menu.push({ id, kategori_id, nama_menu, deskripsi, harga, foto, status });
    res.status(201).json({ success: true, id });
  });

  app.put('/api/admin/menu', requireRole('admin'), (req, res) => {
    const id = Number(req.body?.id);
    const row = db.menu.find((m) => m.id === id);
    const nama_menu = String(req.body?.nama_menu ?? '').trim();
    const harga = Number(req.body?.harga);
    if (!row || !nama_menu || !Number.isFinite(harga) || harga <= 0) {
      res.status(422).json({ success: false, message: 'Data menu tidak valid.' });
      return;
    }
    row.kategori_id = req.body?.kategori_id ? Number(req.body.kategori_id) : null;
    row.nama_menu = nama_menu;
    row.deskripsi = String(req.body?.deskripsi ?? '').trim() || null;
    row.harga = harga;
    row.foto = String(req.body?.foto ?? '').trim() || null;
    row.status = req.body?.status === 'habis' ? 'habis' : 'tersedia';
    res.json({ success: true });
  });

  app.delete('/api/admin/menu', requireRole('admin'), (req, res) => {
    const id = Number(req.query.id ?? req.body?.id);
    if (db.detail_pesanan.some((d) => d.menu_id === id)) {
      res.status(409).json({
        success: false,
        message: 'Menu memiliki riwayat transaksi pesanan. Ubah status menjadi habis.',
      });
      return;
    }
    db.menu = db.menu.filter((m) => m.id !== id);
    res.json({ success: true });
  });

  // Admin Warkop & Koordinat
  app.post('/api/admin/warkop', requireRole('admin'), (req, res) => {
    const nama = String(req.body?.nama ?? '').trim();
    if (!nama) {
      res.status(422).json({ success: false, message: 'Nama usaha kuliner wajib diisi.' });
      return;
    }
    const id = db.nextId.warkop++;
    db.warkop.push({
      id,
      nama,
      alamat: String(req.body?.alamat ?? '').trim() || null,
      latitude: req.body?.latitude !== '' && req.body?.latitude != null ? Number(req.body.latitude) : null,
      longitude: req.body?.longitude !== '' && req.body?.longitude != null ? Number(req.body.longitude) : null,
      deskripsi: String(req.body?.deskripsi ?? '').trim() || null,
      telepon: String(req.body?.telepon ?? '').trim() || null,
    });
    res.status(201).json({ success: true, id });
  });

  app.put('/api/admin/warkop', requireRole('admin'), (req, res) => {
    const id = Number(req.body?.id);
    const row = db.warkop.find((w) => w.id === id);
    const nama = String(req.body?.nama ?? '').trim();
    if (!row || !nama) {
      res.status(422).json({ success: false, message: 'ID dan nama usaha kuliner wajib diisi.' });
      return;
    }
    row.nama = nama;
    row.alamat = String(req.body?.alamat ?? '').trim() || null;
    row.latitude = req.body?.latitude !== '' && req.body?.latitude != null ? Number(req.body.latitude) : null;
    row.longitude = req.body?.longitude !== '' && req.body?.longitude != null ? Number(req.body.longitude) : null;
    row.deskripsi = String(req.body?.deskripsi ?? '').trim() || null;
    row.telepon = String(req.body?.telepon ?? '').trim() || null;
    res.json({ success: true });
  });

  app.delete('/api/admin/warkop', requireRole('admin'), (req, res) => {
    const id = Number(req.query.id ?? req.body?.id);
    db.warkop = db.warkop.filter((w) => w.id !== id);
    res.json({ success: true });
  });

  // Admin Pelanggan
  app.get('/api/admin/customers', requireRole('admin'), (_req, res) => {
    res.json({ success: true, customers: db.pelanggan });
  });

  app.put('/api/admin/customers', requireRole('admin'), (req, res) => {
    const id = Number(req.body?.id);
    const row = db.pelanggan.find((c) => c.id === id);
    const nama = String(req.body?.nama ?? '').trim();
    const telepon = normalizePhone(String(req.body?.telepon ?? ''));
    if (!row || !nama || !telepon) {
      res.status(422).json({ success: false, message: 'Data pelanggan tidak lengkap.' });
      return;
    }
    row.nama = nama;
    row.telepon = telepon;
    row.email = String(req.body?.email ?? '').trim() || null;
    row.alamat = String(req.body?.alamat ?? '').trim() || null;
    res.json({ success: true });
  });

  app.delete('/api/admin/customers', requireRole('admin'), (req, res) => {
    const id = Number(req.query.id ?? req.body?.id);
    if (db.pesanan.some((p) => p.pelanggan_id === id)) {
      res.status(409).json({
        success: false,
        message: 'Pelanggan memiliki riwayat pesanan dan tidak dapat dihapus.',
      });
      return;
    }
    db.pelanggan = db.pelanggan.filter((c) => c.id !== id);
    res.json({ success: true });
  });

  // Admin Pesanan
  app.get('/api/admin/orders', requireRole('admin'), (_req, res) => {
    res.json({ success: true, orders: db.pesanan.map(enrichOrder) });
  });

  app.put('/api/admin/orders', requireRole('admin'), (req, res) => {
    const id = Number(req.body?.id);
    const status = String(req.body?.status ?? '');
    const allowed = ['menunggu', 'diproses', 'selesai', 'dibatalkan'];
    const row = db.pesanan.find((p) => p.id === id);
    if (!row || !allowed.includes(status)) {
      res.status(422).json({ success: false, message: 'Status pesanan tidak valid.' });
      return;
    }
    row.status = status as Pesanan['status'];
    res.json({ success: true });
  });

  // Admin Pembayaran
  app.get('/api/admin/payments', requireRole('admin'), (_req, res) => {
    const payments = db.pembayaran.map((pb) => {
      const order = db.pesanan.find((p) => p.id === pb.pesanan_id);
      const cust = order ? db.pelanggan.find((c) => c.id === order.pelanggan_id) : undefined;
      return {
        ...pb,
        kode_pesanan: order?.kode_pesanan,
        pelanggan_nama: cust?.nama,
      };
    });
    res.json({ success: true, payments });
  });

  app.put('/api/admin/payments', requireRole('admin'), (req, res) => {
    const id = Number(req.body?.id);
    const status = String(req.body?.status ?? '');
    const allowed = ['belum_bayar', 'menunggu_verifikasi', 'lunas', 'gagal'];
    const row = db.pembayaran.find((pb) => pb.id === id);
    if (!row || !allowed.includes(status)) {
      res.status(422).json({ success: false, message: 'Status pembayaran tidak valid.' });
      return;
    }
    row.status = status as Pembayaran['status'];
    row.tanggal_bayar = status === 'lunas' ? new Date().toISOString() : null;
    res.json({ success: true });
  });

  // Admin Reservasi
  app.get('/api/admin/reservations', requireRole('admin'), (_req, res) => {
    const reservations = db.reservasi.map((r) => {
      const cust = db.pelanggan.find((c) => c.id === r.pelanggan_id);
      return {
        ...r,
        pelanggan_nama: cust?.nama,
        pelanggan_telepon: cust?.telepon,
      };
    });
    res.json({ success: true, reservations });
  });

  app.put('/api/admin/reservations', requireRole('admin'), (req, res) => {
    const id = Number(req.body?.id);
    const status = String(req.body?.status ?? '');
    const allowed = ['menunggu', 'dikonfirmasi', 'ditolak', 'selesai', 'dibatalkan'];
    const row = db.reservasi.find((r) => r.id === id);
    if (!row || !allowed.includes(status)) {
      res.status(422).json({ success: false, message: 'Status reservasi tidak valid.' });
      return;
    }
    row.status = status as Reservasi['status'];
    res.json({ success: true });
  });

  const distDir = path.resolve(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distDir);

  if (isProd) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SEJATI MAPS berjalan di http://localhost:${PORT}`);
  });
}

startServer();
