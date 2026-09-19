# Toko Makanan Front-End (`tokomakanan-fe`)

Sistem Manajemen Toko Roti & Kasir Point of Sale (POS) modern berstandar enterprise yang dibangun dengan **React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query v5, Zustand, Axios, React Hook Form, dan Zod**.

Aplikasi ini dirancang untuk konsumsi REST API backend Go Gin (`tokomakanan`), menghadirkan alur operasional kasir berkecepatan tinggi, cetak struk thermal 80mm & 58mm, tautan nota digital via WhatsApp, manajemen master produk, paket bundling, pelanggan, analitik penjualan, dan proteksi finansial ketat berbasis Role-Based Access Control (RBAC).

---

## 🌟 Fitur Utama

1. **Kasir Point of Sale (POS) Split-Screen**:
   - Tampilan sentuh/tablet responsif: katalog produk/paket di sisi kiri, keranjang checkout di sisi kanan.
   - Mode transaksi fleksibel: **Direct Sale** (Penjualan Langsung di Tempat) dan **Pre-Order (PO)**.
   - Papan kalkulator nominal uang cepat (*Uang Pas*, *Rp 20.000*, *Rp 50.000*, *Rp 100.000*, dll) dengan kalkulasi kembalian otomatis.
   - Cetak struk printer thermal (80mm & 58mm) via `@media print`.
   - Tombol instan kirim nota digital pelanggan ke WhatsApp.

2. **Manajemen Transaksi & Pelunasan**:
   - Riwayat pesanan dengan filter tanggal, pencarian nomor invoice, tipe order, dan status.
   - Alur status pesanan terverifikasi (*State Machine*):
     - `DRAFT` ➔ `DP_PAID` ➔ `PAID` ➔ `READY` ➔ `COMPLETED`
   - Modal tambah pembayaran susulan / pelunasan PO dengan pencegahan kelebihan bayar (*anti-overpayment*).

3. **Master Data & Pricing Guard**:
   - **Produk**: Validasi bisnis `sell_price >= hpp`, pencarian nama, filter kategori, dan pagination.
   - **Paket Bundling**: Builder multi-produk dinamis dengan penghitungan otomatis akumulasi HPP modal barang.
   - **Pelanggan**: Direktori kontak dengan tombol direct chat WhatsApp.

4. **Keamanan Finansial & Role-Based Access Control (RBAC)**:
   - **`superadmin`**: Akses penuh ke seluruh fitur dan sistem manajemen user.
   - **`owner`**: Akses analitik, laporan penjualan, margin laba kotor, dan operasional (tanpa kelola user).
   - **`admin` (Kasir)**: Operasional POS, riwayat transaksi, pelanggan, dan cetak struk. **Seluruh data HPP unit produk, modal HPP paket, dan laba kotor toko disembunyikan/ditiadakan secara ketat**.

5. **Dashboard Analitik & Laporan Keuangan**:
   - 4 kartu ringkasan harian: Omset Hari Ini, Jumlah Transaksi, PO Aktif, dan Laba Kotor (Role-Protected).
   - Grafik batang tren penjualan interaktif (pilihan rentang: 7 Hari, 14 Hari, 30 Hari).
   - Widget pengingat pesanan Pre-Order yang jatuh tempo pada hari ini.
   - Laporan berkala dan ekspor CSV akuntansi (*UTF-8 with BOM* agar langsung rapi dibuka di Microsoft Excel).

6. **Nota Digital Publik Pelanggan (`/invoice/:token`)**:
   - Halaman nota publik tanpa autentikasi JWT bagi pelanggan yang menerima tautan melalui WhatsApp atau QR code.
   - Desain ramah perangkat seluler, status pesanan real-time, dan zero kebocoran data rahasia HPP toko.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (Strict Mode)
- **Language**: TypeScript 5.8+ (Strict type checking)
- **Bundler**: Vite 6+
- **Styling**: Tailwind CSS v4 (@tailwindcss/vite)
- **Server State**: TanStack Query v5 (React Query)
- **Client State**: Zustand
- **HTTP Client**: Axios dengan correlation ID `X-Request-ID`
- **Form & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Security**: DOMPurify sanitization & memory-backed token storage
- **Linter**: ESLint (Flat config `eslint.config.js`)

---

## 📂 Struktur Proyek

```
tokomakanan-fe/
├── src/
│   ├── components/
│   │   ├── feedback/       # Toast, LoadingSpinner, EmptyState, ErrorBoundary
│   │   ├── guard/          # ProtectedRoute, RoleGuard
│   │   ├── layout/         # AppLayout, Navbar, Sidebar
│   │   └── ui/             # Button, Input, Modal, Card, Badge, Table
│   ├── core/
│   │   ├── api/            # Axios client, interceptors, error handler
│   │   ├── config/         # Environment variables & constants
│   │   ├── logger/         # Structured client-side logger
│   │   ├── security/       # Token storage & DOMPurify sanitizer
│   │   └── types/          # TypeScript common interfaces & API envelopes
│   ├── features/
│   │   ├── auth/           # Login, Change Password, authApi
│   │   ├── customers/      # Pelanggan CRUD & CustomerModal
│   │   ├── dashboard/      # Metrics, SalesBarChart, POReminderWidget
│   │   ├── orders/         # OrdersListPage, OrderDetailPage, OrderStatusBadge
│   │   ├── packages/       # Paket Bundling CRUD & PackageModal
│   │   ├── payments/       # AddPaymentModal & paymentsApi
│   │   ├── pos/            # Split-screen PosPage, CartSidebar, ThermalReceipt
│   │   ├── products/       # Produk Master CRUD & ProductModal
│   │   ├── public-invoice/ # PublicInvoicePage (/invoice/:token)
│   │   ├── reports/        # ReportsPage (Sales & Profit analysis, CSV export)
│   │   ├── settings/       # Store Settings & Live Thermal Preview
│   │   └── users/          # Users management (Superadmin only)
│   ├── routes/             # Centralized routing with code splitting
│   ├── stores/             # authStore, posCartStore, uiStore
│   └── utils/              # currency (IDR), cn, date formatters
├── CODING_STANDARD.md      # Standar arsitektur & penulisan kode resmi
└── vite.config.ts          # Konfigurasi Vite & path alias
```

---

## 🔑 Akun Demo Pengujian

Aplikasi telah dilengkapi dengan tombol *One-Click Preset* pada halaman login untuk pengujian cepat:

| Role | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `superadmin@tokomakanan.com` | `SuperAdmin123!` | Akses penuh, Kelola User, Laporan, HPP, Settings |
| **Owner** | `budi.owner@tokomakanan.com` | `Password123!` | Analitik, Laba Kotor, HPP, Produk, Kasir (Tanpa Kelola User) |
| **Kasir (Admin)** | `kasir1@tokomakanan.com` | `Password123!` | Kasir POS, Pelanggan, Struk (HPP & Laba disembunyikan ketat) |

---

## 🚀 Memulai Proyek

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan
Pastikan file `.env` telah terkonfigurasi dengan URL backend Go:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_ENV=development
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Akses aplikasi di browser pada: `http://localhost:5173`.

### 4. Pengecekan Linter & Typecheck
```bash
# Menjalankan ESLint
npm run lint

# Menjalankan build produksi & typecheck TypeScript
npm run build
```

---

## 📄 Standar Koding
Untuk pedoman penulisan kode, penanganan error, dan arsitektur layer, silakan merujuk ke dokumen [`CODING_STANDARD.md`](./CODING_STANDARD.md).
