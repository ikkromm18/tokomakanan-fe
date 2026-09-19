import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Search, Edit2, Trash2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { UserModal } from '../components/UserModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/feedback/toastStore';
import { parseApiError } from '@/core/api/errorHandler';
import type { User, UserQueryParams } from '../types/users';
import type { UserRole } from '@/core/types/common';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    role: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Pengguna berhasil dinonaktifkan/dihapus');
      setUserToDelete(null);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      toast.error('Gagal menghapus pengguna', parsed.message);
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, role: e.target.value as UserRole | '', page: 1 }));
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const roleBadges: Record<UserRole, { label: string; variant: 'danger' | 'info' | 'success' }> = {
    superadmin: { label: 'Superadmin', variant: 'danger' },
    owner: { label: 'Owner', variant: 'info' },
    admin: { label: 'Kasir', variant: 'success' },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kelola hak akses dan akun staf kasir serta akun manajemen toko.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Tambah Pengguna
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Cari nama atau email pengguna..."
            value={params.search}
            onChange={handleSearchChange}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={params.role || ''}
            onChange={handleRoleFilter}
            className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
          >
            <option value="">Semua Role</option>
            <option value="superadmin">Superadmin</option>
            <option value="owner">Owner</option>
            <option value="admin">Kasir (Admin)</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingSpinner text="Memuat data pengguna..." size="lg" />
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-7 h-7" />}
          title="Tidak Ada Pengguna Ditemukan"
          description="Tidak ada data akun yang cocok dengan kata kunci pencarian atau filter yang dipilih."
          action={
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              Buat Pengguna Baru
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Nama Pengguna</TableHead>
                <TableHead>Email Login</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((user) => {
                const badge = roleBadges[user.role];
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs text-stone-400">
                      #{user.id}
                    </TableCell>
                    <TableCell className="font-semibold text-stone-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-stone-600 font-mono text-xs">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="success" size="sm">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Non-Aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit akun"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.role !== 'superadmin' && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {data.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-stone-500">
              <p>
                Menampilkan halaman {data.meta.page} dari {data.meta.total_pages} ({data.meta.total_rows} total user)
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

      {/* User Create/Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={selectedUser}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        title="Konfirmasi Hapus Pengguna"
        description="Apakah Anda yakin ingin menonaktifkan pengguna ini?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-stone-600">
            Akun milik <span className="font-bold text-stone-900">{userToDelete?.name}</span> ({userToDelete?.email}) akan dinonaktifkan dan tidak dapat digunakan untuk login operasional lagi.
          </p>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
            >
              Ya, Hapus Pengguna
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
