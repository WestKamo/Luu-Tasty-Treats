import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  lineId: string;
  cakeId: string;
  cakeName: string;
  quantity: number;
  unitPricePreview: number;
  customText?: string;
  selectedOptionIds: string[];
}

interface CartState {
  lines: CartLine[];
  bumpTick: number;
  addLine: (line: CartLine) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  subtotalPreview: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      bumpTick: 0,
      addLine: (line) => set((state) => ({ lines: [...state.lines, line], bumpTick: state.bumpTick + 1 })),
      removeLine: (lineId) => set((state) => ({ lines: state.lines.filter((l) => l.lineId !== lineId) })),
      clear: () => set({ lines: [] }),
      subtotalPreview: () => get().lines.reduce((sum, l) => sum + l.unitPricePreview * l.quantity, 0),
    }),
    { name: "luu-tasty-treats-cart" }
  )
);
