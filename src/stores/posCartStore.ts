import { create } from 'zustand';
import type { ItemType, OrderType } from '@/core/types/common';
import type { Customer } from '@/features/customers/types/customer';

export interface CartItem {
  cartId: string; // e.g. 'PRODUCT-1' or 'PACKAGE-2'
  item_type: ItemType;
  item_id: number;
  name: string;
  unit_price: number;
  quantity: number;
}

export interface PosCartState {
  items: CartItem[];
  orderType: OrderType;
  customer: Customer | null;
  pickupDate: string;
  notes: string;
  discountAmount: number;

  // Actions
  addItem: (item: { id: number; name: string; sell_price: number; type: ItemType }) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  incrementQuantity: (cartId: string) => void;
  decrementQuantity: (cartId: string) => void;
  setOrderType: (type: OrderType) => void;
  setCustomer: (customer: Customer | null) => void;
  setPickupDate: (date: string) => void;
  setNotes: (notes: string) => void;
  setDiscountAmount: (discount: number) => void;
  clearCart: () => void;

  // Computed Helpers
  getSubtotal: () => number;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const usePosCartStore = create<PosCartState>((set, get) => ({
  items: [],
  orderType: 'DIRECT_SALE',
  customer: null,
  pickupDate: '',
  notes: '',
  discountAmount: 0,

  addItem: (product) => {
    const cartId = `${product.type}-${product.id}`;
    const { items } = get();
    const existingIndex = items.findIndex((it) => it.cartId === cartId);

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1,
      };
      set({ items: updated });
    } else {
      set({
        items: [
          ...items,
          {
            cartId,
            item_type: product.type,
            item_id: product.id,
            name: product.name,
            unit_price: product.sell_price,
            quantity: 1,
          },
        ],
      });
    }
  },

  removeItem: (cartId) => {
    set({ items: get().items.filter((it) => it.cartId !== cartId) });
  },

  updateQuantity: (cartId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartId);
      return;
    }
    set({
      items: get().items.map((it) =>
        it.cartId === cartId ? { ...it, quantity } : it
      ),
    });
  },

  incrementQuantity: (cartId) => {
    set({
      items: get().items.map((it) =>
        it.cartId === cartId ? { ...it, quantity: it.quantity + 1 } : it
      ),
    });
  },

  decrementQuantity: (cartId) => {
    const item = get().items.find((it) => it.cartId === cartId);
    if (!item) return;
    if (item.quantity <= 1) {
      get().removeItem(cartId);
    } else {
      set({
        items: get().items.map((it) =>
          it.cartId === cartId ? { ...it, quantity: it.quantity - 1 } : it
        ),
      });
    }
  },

  setOrderType: (type) => set({ orderType: type }),
  setCustomer: (customer) => set({ customer }),
  setPickupDate: (pickupDate) => set({ pickupDate }),
  setNotes: (notes) => set({ notes }),
  setDiscountAmount: (discountAmount) => set({ discountAmount: Math.max(0, discountAmount) }),

  clearCart: () =>
    set({
      items: [],
      orderType: 'DIRECT_SALE',
      customer: null,
      pickupDate: '',
      notes: '',
      discountAmount: 0,
    }),

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - get().discountAmount);
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
