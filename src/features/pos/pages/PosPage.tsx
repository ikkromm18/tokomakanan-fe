import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCatalog } from '../components/ProductCatalog';
import { CartSidebar } from '../components/CartSidebar';
import { PaymentModal } from '../components/PaymentModal';
import { ThermalReceipt } from '../components/ThermalReceipt';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { Modal } from '@/components/ui/Modal';
import type { Order } from '@/features/orders/types/order';

export const PosPage: React.FC = () => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Fetch store settings for receipt headers & footer
  const { data: storeSettings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: settingsApi.getSettings,
  });

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Split-screen POS Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        {/* Left: Product & Package Catalog (7 or 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 h-full overflow-hidden flex flex-col">
          <ProductCatalog />
        </div>

        {/* Right: Cart & Checkout Summary (5 or 4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 h-full overflow-hidden">
          <CartSidebar onProceedPayment={() => setIsPaymentOpen(true)} />
        </div>
      </div>

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={(createdOrder) => {
          setCompletedOrder(createdOrder);
        }}
      />

      {/* Post-Transaction Thermal Receipt & WhatsApp Modal */}
      <Modal
        isOpen={Boolean(completedOrder)}
        onClose={() => setCompletedOrder(null)}
        maxWidth="lg"
        title="Nota Transaksi Kasir"
        description="Struk belanja kasir siap dicetak pada printer thermal atau dikirim ke WhatsApp pelanggan."
      >
        {completedOrder && (
          <ThermalReceipt
            order={completedOrder}
            storeSettings={storeSettings}
            onDone={() => setCompletedOrder(null)}
          />
        )}
      </Modal>
    </div>
  );
};
