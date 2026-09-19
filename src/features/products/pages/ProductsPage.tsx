import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react';
import { productApi } from '../api/productApi';
import { ProductModal } from '../components/ProductModal';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/feedback/toastStore';
import { parseApiError } from '@/core/api/errorHandler';
import { formatRupiah } from '@/utils/currency';
import type { Product, ProductQueryParams } from '../types/product';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const hasRole = useAuthStore((s) => s.hasRole);
  const canManage = hasRole(['superadmin', 'owner']);

  const [params, setParams] = useState<ProductQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    category: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk berhasil dihapus');
      setProductToDelete(null);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error('Gagal menghapus produk', parsed.message);
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, category: e.target.value, page: 1 }));
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Master Data Produk
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Daftar menu roti, pastry, kue, serta pengaturan harga modal (HPP) dan jual.
          </p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            size="md"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tambah Produk
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Cari nama produk..."
            value={params.search}
            onChange={handleSearchChange}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-56">
          <select
            value={params.category || ''}
            onChange={handleCategoryFilter}
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
          >
            <option value="">Semua Kategori</option>
            <option value="Bakery">Bakery</option>
            <option value="Pastry">Pastry</option>
            <option value="Cake">Cake</option>
            <option value="Roti Manis">Roti Manis</option>
            <option value="Roti Tawar">Roti Tawar</option>
            <option value="Kue Kering">Kue Kering</option>
            <option value="Minuman">Minuman</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingSpinner text="Memuat katalog produk..." size="lg" />
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="w-7 h-7" />}
          title="Tidak Ada Produk"
          description="Belum ada produk yang terdaftar atau sesuai dengan kriteria pencarian."
          action={
            canManage ? (
              <Button variant="outline" size="sm" onClick={openCreateModal}>
                Tambah Produk Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                {canManage && <TableHead className="text-right">HPP Modal</TableHead>}
                <TableHead className="text-right">Harga Jual</TableHead>
                {canManage && <TableHead className="text-right">Estimasi Laba</TableHead>}
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((product) => {
                const profit = product.hpp !== null ? product.sell_price - product.hpp : null;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs text-stone-400">
                      #{product.id}
                    </TableCell>
                    <TableCell className="font-semibold text-stone-900">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium">
                        {product.category}
                      </span>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right font-mono text-xs text-stone-600">
                        {formatRupiah(product.hpp)}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-semibold text-stone-900 font-mono text-xs">
                      {formatRupiah(product.sell_price)}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right font-mono text-xs text-emerald-700 font-medium">
                        {profit !== null ? formatRupiah(profit) : '-'}
                      </TableCell>
                    )}
                    <TableCell>
                      {product.is_active ? (
                        <Badge variant="success" size="sm">
                          Tersedia
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Non-Aktif
                        </Badge>
                      )}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-stone-500">
              <p>
                Menampilkan halaman {data.meta.page} dari {data.meta.total_pages} ({data.meta.total_rows} total produk)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={params.page === 1}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={params.page === data.meta.total_pages}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {canManage && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productToEdit={selectedProduct}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        title="Konfirmasi Hapus Produk"
        description="Apakah Anda yakin ingin menghapus produk ini dari katalog toko?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-stone-600">
            Produk <span className="font-bold text-stone-900">{productToDelete?.name}</span> akan dihapus (soft delete). Jika produk sedang digunakan dalam paket bundling aktif, penghapusan akan ditolak oleh sistem.
          </p>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProductToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
            >
              Ya, Hapus Produk
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
