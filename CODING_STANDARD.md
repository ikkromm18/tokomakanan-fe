# Frontend Coding Standard — tokomakanan-fe

Stack: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query v5, Zustand, Axios, React Hook Form, Zod

Backend Source of Truth: `tokomakanan` (Go Gin Gonic)

---

## 1. Arsitektur Layer Front-End

Front-end mengadopsi prinsip Clean & Feature-Driven Architecture dengan aliran dependensi satu arah:

```
UI Page (features/*/pages)
   │
   ▼
Feature Hook & Component (features/*/components, features/*/hooks)
   │
   ▼
Feature API Service (features/*/api)
   │
   ▼
Core HTTP Client (core/api/client.ts)
   │
   ▼
Backend REST API (/api/v1)
```

### Aturan Batasan Layer (*Boundary Rules*)
1. **Isolasi Fitur**: Fitur dalam `features/pos/` dilarang mengimpor komponen atau logika privat dari `features/reports/`. Jika ada komponen yang dipakai bersama, pindahkan ke `src/components/ui/` atau `src/components/feedback/`.
2. **Komunikasi Antar Fitur**: Dilakukan hanya melalui navigasi rute URL (`navigate('/orders')`) atau shared stores global (`authStore`, `posCartStore`).
3. **Penyimpanan State**:
   - **Server State**: Wajib menggunakan **TanStack Query v5** (`useQuery`, `useMutation`). Dilarang menyimpan data master (produk, paket, order) di `useState` lokal lalu melakukan sync manual.
   - **Client UI State**: Gunakan **Zustand** untuk state reaktif global (keranjang kasir, auth token/user, preferensi tema/printer).
   - **Form State**: Gunakan **React Hook Form** + **Zod Resolver**. Dilarang menggunakan banyak `useState` terpisah untuk input form.

---

## 2. Standar TypeScript & Kontrak Data

1. **Zero `any` Policy**:
   - Dilarang keras menggunakan tipe `any`. Gunakan `unknown` jika tipe benar-benar belum diketahui dan lakukan *type narrowing*.
   - Semua respons backend wajib dibungkus dalam generic `ApiResponse<T>` atau `PaginatedResponse<T>`.

```typescript
// BENAR
export interface Product {
  id: number;
  name: string;
  category: string;
  hpp: number | null; // null jika diakses role admin
  sell_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductListResponse = PaginatedResponse<Product>;

// SALAH
export const fetchProducts = async (): Promise<any> => { ... };
```

2. **Konsistensi Nama DTO**:
   - Request DTO: `<Action><Entity>Request` (contoh: `CreateProductRequest`, `UpdateStoreSettingRequest`, `LoginRequest`).
   - Response DTO: `<Entity>Response` atau `<Entity>` (contoh: `ProductResponse`, `OrderDetailResponse`).

---

## 3. Integrasi HTTP & Error Handling

Semua komunikasi API wajib melalui instance `apiClient` di `@/core/api/client`.

### Konvensi Respon Backend:
| Kode HTTP | Penanganan di Front-End |
|---|---|
| `200 / 201` | Data di-unwrap otomatis oleh interceptor. Menghasilkan objek bertipe `T`. |
| `400` | Validation Error. Ekstrak array `errors: [{ field, message }]` dan pasang ke React Hook Form via `setError`. |
| `401` | Unauthorized. Sesi kedaluwarsa. Otomatis jalankan `useAuthStore.getState().logout()`, tampilkan toast, dan redirect ke `/login`. |
| `403` | Forbidden. Role tidak berizin. Tampilkan toast peringatan akses ditolak, arahkan ke rute aman (`/pos`). |
| `404` | Not Found. Tampilkan komponen `<EmptyState />` dengan pesan informatif. |
| `409` | Conflict. Duplikasi data unik (nama produk/email/telepon). Tampilkan toast error spesifik. |
| `422` | Unprocessable Entity. Pelanggaran aturan bisnis (misal: harga jual < HPP atau nominal bayar melebihi sisa tagihan). Tampilkan dialog error bisnis. |
| `500` | Internal Server Error. Tampilkan pesan ramah pengguna bersama referensi `X-Request-ID`. |

---

## 4. Keamanan Front-End (Security)

1. **Pencegahan XSS (Cross-Site Scripting)**:
   - Gunakan helper `sanitizeHtml` dari `@/core/security/sanitizer` jika terpaksa merender teks yang mengandung formatting HTML atau markdown (misal catatan pesanan khusus atau footer nota).
   - Dilarang menggunakan `dangerouslySetInnerHTML` tanpa melewati `DOMPurify.sanitize()`.
2. **Manajemen Token JWT**:
   - Token disimpan melalui abstraksi `@/core/security/tokenStorage`.
   - Dilarang menyimpan kata sandi plain text di browser storage atau state apapun.
3. **Data Masking HPP**:
   - Role `admin` (kasir) tidak boleh melihat kolom HPP atau Laba Kotor.
   - Bungkus komponen finansial rahasia dengan `<RoleGuard allowedRoles={['superadmin', 'owner']}>`.

---

## 5. Observabilitas & Structured Logging

Gunakan logger terpusat `@/core/logger/logger`:

```typescript
import { logger } from '@/core/logger/logger';

// Log operasi penting
logger.info('Order successfully submitted', {
  component: 'useCreateOrderMutation',
  orderId: 15,
  totalAmount: 36000,
});

// Log error
logger.error('Failed to process payment', {
  component: 'PaymentModal',
  statusCode: 422,
  error: err.message,
});
```

**ATURAN KERAS:**
- Dilarang menggunakan `console.log` mentah di kode produksi.
- Dilarang mencatat kata sandi, token JWT, atau informasi rahasia ke dalam logger.
- Setiap outgoing request HTTP menyertakan header korelasi `X-Request-ID`.

---

## 6. Standar Cetak Struk Thermal (80mm & 58mm)

1. Struk thermal kasir wajib menggunakan layout khusus `@media print` yang didefinisikan di `src/index.css`.
2. Gunakan font monospaced (`Courier New`, `ui-monospace`) agar perataan kolom harga dan nama item tetap presisi.
3. Hindari penggunaan elemen grafis berat pada struk thermal untuk menghemat waktu cetak kasir.

---

## 7. Konvensi Penamaan (Naming Conventions)

| Elemen | Format | Contoh |
|---|---|---|
| Komponen React | `PascalCase.tsx` | `ProductCard.tsx`, `PaymentModal.tsx` |
| Halaman Rute | `PascalCase.tsx` | `PosPage.tsx`, `OrdersListPage.tsx` |
| Custom Hooks | `camelCase.ts` | `useThermalPrint.ts`, `useProductsQuery.ts` |
| Store Zustand | `camelCase.ts` | `authStore.ts`, `posCartStore.ts` |
| Utility / Helpers | `camelCase.ts` | `formatRupiah.ts`, `formatDate.ts` |
| TypeScript Types | `PascalCase` | `Product`, `CreateOrderRequest` |
| Feature Folders | `kebab-case` | `public-invoice`, `store-settings` |
