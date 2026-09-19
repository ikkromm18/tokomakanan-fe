import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { packageApi } from '../api/packageApi';
import { PackageModal } from '../components/PackageModal';
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
import type { Package, PackageQueryParams } from '../types/package';

export const PackagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const hasRole = useAuthStore((s) => s.hasRole);
  const canManage = hasRole(['superadmin', 'owner']);

  const [params, setParams] = useState<PackageQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['packages', params],
    queryFn: () => packageApi.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => packageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Paket berhasil dihapus');
      setPackageToDelete(null);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error('Gagal menghapus paket', parsed.message);
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const openCreateModal = () => {
    setSelectedPackage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Paket Bundling Produk
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kombinasi bundling menu roti dan kue untuk promosi atau paket katering.
          </p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            size="md"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Buat Paket Baru
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <Input
          placeholder="Cari nama paket bundling..."
          value={params.search}
          onChange={handleSearchChange}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Packages Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingSpinner text="Memuat daftar paket bundling..." size="lg" />
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-7 h-7" />}
          title="Tidak Ada Paket Bundling"
          description="Belum ada paket bundling yang terdaftar. Buat paket hemat pertama untuk toko Anda."
          action={
            canManage ? (
              <Button variant="outline" size="sm" onClick={openCreateModal}>
                Buat Paket Pertama
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
                <TableHead>Nama Paket</TableHead>
                <TableHead>Komposisi Produk</TableHead>
                {canManage && <TableHead className="text-right">Total HPP</TableHead>}
                <TableHead className="text-right">Harga Jual Paket</TableHead>
                {canManage && <TableHead className="text-right">Estimasi Laba</TableHead>}
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((pkg) => {
                const profit = pkg.total_hpp !== null ? pkg.sell_price - pkg.total_hpp : null;
                return (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-mono text-xs text-stone-400">
                      #{pkg.id}
                    </TableCell>
                    <TableCell className="font-semibold text-stone-900">
                      {pkg.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {pkg.items && pkg.items.length > 0 ? (
                          pkg.items.map((it) => (
                            <span
                              key={it.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium"
                            >
                              {it.quantity}x {it.product_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-stone-400 italic">Tanpa item</span>
                        )}
                      </div>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right font-mono text-xs text-stone-600">
                        {formatRupiah(pkg.total_hpp)}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-semibold text-stone-900 font-mono text-xs">
                      {formatRupiah(pkg.sell_price)}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right font-mono text-xs text-emerald-700 font-medium">
                        {profit !== null ? formatRupiah(profit) : '-'}
                      </TableCell>
                    )}
                    <TableCell>
                      {pkg.is_active ? (
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
                            onClick={() => openEditModal(pkg)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit paket"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPackageToDelete(pkg)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus paket"
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
                Menampilkan halaman {data.meta.page} dari {data.meta.total_pages} ({data.meta.total_rows} total paket)
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
        <PackageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          packageToEdit={selectedPackage}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['packages'] })}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(packageToDelete)}
        onClose={() => setPackageToDelete(null)}
        title="Konfirmasi Hapus Paket"
        description="Apakah Anda yakin ingin menghapus paket bundling ini?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-stone-600">
            Paket <span className="font-bold text-stone-900">{packageToDelete?.name}</span> akan dihapus (soft delete).
          </p>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPackageToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => packageToDelete && deleteMutation.mutate(packageToDelete.id)}
            >
              Ya, Hapus Paket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
