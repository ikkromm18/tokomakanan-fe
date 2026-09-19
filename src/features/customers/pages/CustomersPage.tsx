import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Search, Edit2, MessageCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { customerApi } from '../api/customerApi';
import { CustomerModal } from '../components/CustomerModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Customer, CustomerQueryParams } from '../types/customer';

export const CustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<CustomerQueryParams>({
    page: 1,
    limit: 10,
    search: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.list(params),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const openCreateModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const getCleanWaNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      return `62${digits.slice(1)}`;
    }
    return digits;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Data Pelanggan
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Direktori kontak pelanggan untuk pengiriman nota digital WhatsApp dan pesanan Pre-Order (PO).
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Daftar Pelanggan Baru
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <Input
          placeholder="Cari nama atau nomor WhatsApp pelanggan..."
          value={params.search}
          onChange={handleSearchChange}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <LoadingSpinner text="Memuat daftar pelanggan..." size="lg" />
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="Tidak Ada Pelanggan Ditemukan"
          description="Belum ada data pelanggan yang cocok dengan pencarian Anda."
          action={
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              Daftarkan Pelanggan Pertama
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>No. WhatsApp / Telepon</TableHead>
                <TableHead>Alamat Pengantaran</TableHead>
                <TableHead>Terdaftar Sejak</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((customer) => {
                const cleanPhone = getCleanWaNumber(customer.phone);
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-xs text-stone-400">
                      #{customer.id}
                    </TableCell>
                    <TableCell className="font-semibold text-stone-900">
                      {customer.name}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-stone-800">
                        {customer.phone}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-stone-600 max-w-xs truncate">
                      {customer.address || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {new Date(customer.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp Link button */}
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                          title="Hubungi via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(customer)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit data pelanggan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-stone-500">
              <p>
                Menampilkan halaman {data.meta.page} dari {data.meta.total_pages} ({data.meta.total_rows} total pelanggan)
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

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customerToEdit={selectedCustomer}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['customers'] })}
      />
    </div>
  );
};
