import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PlaceOrderItemInput } from "@/types/orders";
import { CustomizationOption } from "@/types/catalog";

export interface CartLine extends PlaceOrderItemInput {
  lineId: string;           // client-generated, for React keys / removal
  cakeName: string;
  unitPricePreview: number; // client-side estimate only — server recalculates authoritatively at checkout
  selectedOptionsPreview: CustomizationOption[];
}

interface CartState {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  subtotalPreview: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line) => set((state) => ({ lines: [...state.lines, line] })),
      removeLine: (lineId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.lineId !== lineId) })),
      clear: () => set({ lines: [] }),
      subtotalPreview: () =>
        get().lines.reduce((sum, l) => sum + l.unitPricePreview * l.quantity, 0),
    }),
    { name: "luu-tasty-treats-cart" }
  )
);
