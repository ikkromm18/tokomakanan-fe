import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatRupiah } from '@/utils/currency';
import type { POReminderOrder } from '../types/dashboard';

export interface POReminderWidgetProps {
  orders: POReminderOrder[];
  isLoading?: boolean;
}

export const POReminderWidget: React.FC<POReminderWidgetProps> = ({ orders, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-stone-700 font-bold mb-4">
          <CalendarCheck className="w-5 h-5 text-amber-600" />
          <h3>Pengambilan Pre-Order Hari Ini</h3>
        </div>
        <div className="py-8 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">
              Jadwal Ambil PO Hari Ini
            </h3>
            <p className="text-[11px] text-stone-500">
              Pesanan jatuh tempo hari ini yang perlu disiapkan atau diserahkan
            </p>
          </div>
        </div>
        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
          {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-stone-400">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-stone-600">
            Tidak ada PO jatuh tempo hari ini
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Semua pesanan terjadwal untuk tanggal lain atau sudah selesai diambil.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-96 pr-1">
          {orders.map((order) => {
            const remaining = Math.max(0, order.total_amount - order.total_paid);

            return (
              <div
                key={order.id}
                className="p-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-xs bg-white transition-all flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-900">
                      {order.invoice_no}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    <span className="font-medium text-stone-900 truncate">
                      {order.customer_name || 'Walk-in'}
                    </span>
                    <span>•</span>
                    <span>{order.items?.length || 0} item</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono font-semibold text-stone-800">
                      {formatRupiah(order.total_amount)}
                    </span>
                    {remaining > 0 ? (
                      <span className="text-rose-600 font-medium flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Sisa {formatRupiah(remaining)}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Lunas</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="shrink-0 group-hover:border-amber-500 group-hover:text-amber-800"
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Proses
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
