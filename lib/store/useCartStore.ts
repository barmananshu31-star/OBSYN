import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderItem } from "@/lib/types";

export interface CartItem extends OrderItem {
  id: string; // Unique cart item identifier (combines product_id + options or custom_design_id)
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        const items = get().items;
        // Generate an ID based on options or random if custom
        const uniqueKey = newItem.is_custom
          ? `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          : `${newItem.product_id}_${newItem.size || "std"}_${newItem.fabric || "std"}_${newItem.pattern || "std"}`;

        const existingIndex = items.findIndex((item) => item.id === uniqueKey);

        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex].quantity += newItem.quantity || 1;
          set({ items: updated, isOpen: true });
        } else {
          set({
            items: [
              ...items,
              {
                ...newItem,
                id: uniqueKey,
                quantity: newItem.quantity || 1,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "obsyn_cart_v1",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
