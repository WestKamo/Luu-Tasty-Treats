import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartOptionPreview {
  optionId: string;
  label: string;
  priceModifier: number;
}

export interface CartLine {
  lineId: string;
  cakeId: string;
  quantity: number;
  customText?: string;
  selectedOptionIds: string[];
  cakeName: string;
  unitPricePreview: number;
  selectedOptionsPreview: CartOptionPreview[];
}

interface CartState {
  lines: CartLine[];
  bumpTick: number;
  addLine: (line: CartLine) => void;
  removeLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
}

// Any value coming back from localStorage could be undefined, a string, or garbage
// from an older schema — never trust it as a number.
export function toSafeNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function lineTotal(line: CartLine): number {
  return toSafeNumber(line.unitPricePreview) * toSafeNumber(line.quantity);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      bumpTick: 0,

      addLine: (line) =>
        set((state) => {
          const signature = (l: CartLine) =>
            `${l.cakeId}|${[...l.selectedOptionIds].sort().join(",")}|${l.customText ?? ""}`;

          const incomingSig = signature(line);
          const existing = state.lines.find((l) => signature(l) === incomingSig);

          // Same cake + same options + same message = bump quantity instead of a duplicate row.
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.lineId === existing.lineId
                  ? { ...l, quantity: toSafeNumber(l.quantity) + toSafeNumber(line.quantity) }
                  : l
              ),
              bumpTick: state.bumpTick + 1,
            };
          }

          return {
            lines: [...state.lines, { ...line, unitPricePreview: toSafeNumber(line.unitPricePreview) }],
            bumpTick: state.bumpTick + 1,
          };
        }),

      removeLine: (lineId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.lineId !== lineId) })),

      setQuantity: (lineId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.lineId === lineId ? { ...l, quantity: Math.max(1, toSafeNumber(quantity)) } : l
          ),
        })),

      clear: () => set({ lines: [], bumpTick: 0 }),
    }),
    {
      name: "luu-tasty-treats-cart",
      // Bumping this invalidates every cart saved under an older shape —
      // this is what clears the broken "R NaN" lines already in your browser.
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2) return { lines: [], bumpTick: 0 };
        return persisted as CartState;
      },
      // Only persist data. Never persist functions — that's what broke subtotalPreview.
      partialize: (state) => ({ lines: state.lines, bumpTick: state.bumpTick }) as CartState,
    }
  )
);
