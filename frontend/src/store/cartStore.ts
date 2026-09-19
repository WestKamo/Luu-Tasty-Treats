import { create } from "zustand";
import { persist } from "middleware/persist"; // or standard persist import depending on your setup

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  lines: CartItem[];
  bumpTick: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  addLine: (item: Omit<CartItem, "quantity">) => void; // Added alias to support components using addLine
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  (set) => ({
    lines: [],
    bumpTick: 0,
    addItem: (newItem) => set((state) => {
      const existingIndex = state.lines.findIndex((l) => l.id === newItem.id);
      let updatedLines = [...state.lines];
      if (existingIndex > -1) {
        updatedLines[existingIndex].quantity += 1;
      } else {
        updatedLines.push({ ...newItem, quantity: 1 });
      }
      return { lines: updatedLines, bumpTick: state.bumpTick + 1 };
    }),
    // Alias addLine to addItem so either function name works seamlessly
    addLine: (newItem) => set((state) => {
      const existingIndex = state.lines.findIndex((l) => l.id === newItem.id);
      let updatedLines = [...state.lines];
      if (existingIndex > -1) {
        updatedLines[existingIndex].quantity += 1;
      } else {
        updatedLines.push({ ...newItem, quantity: 1 });
      }
      return { lines: updatedLines, bumpTick: state.bumpTick + 1 };
    }),
    removeItem: (id) => set((state) => ({
      lines: state.lines.filter((l) => l.id !== id)
    })),
    clearCart: () => set({ lines: [] })
  })
);
