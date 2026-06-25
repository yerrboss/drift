import { create } from "zustand";

type TravelItem = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  accent: string;
};

type TravelState = {
  pool: TravelItem[];
  schedule: Record<string, TravelItem | null>;
  moveItem: (id: string, destination: "pool" | "schedule", slotKey?: string) => void;
  clearSlot: (slotKey: string) => void;
  addIdea: (idea: Omit<TravelItem, "id">) => void;
  updateIdea: (id: string, updates: Partial<TravelItem>) => void;
  deleteIdea: (id: string) => void;
};

const initialPool: TravelItem[] = [
  {
    id: "1",
    title: "Sunrise at N Seoul Tower",
    detail: "Arrive before 7:00 for the best city views without the crowd.",
    meta: "Morning",
    accent: "#6366f1",
  },
  {
    id: "2",
    title: "Hanok district walk",
    detail: "Pause at a tea house and collect local texture.",
    meta: "Culture",
    accent: "#0f172a",
  },
  {
    id: "3",
    title: "Late-night ramen crawl",
    detail: "Keep the evening light and warm with a small circuit.",
    meta: "Night",
    accent: "#475569",
  },
];

export const useTravelStore = create<TravelState>((set) => ({
  pool: initialPool,
  schedule: {},
  addIdea: (idea) =>
    set((state) => ({
      pool: [
        ...state.pool,
        {
          ...idea,
          id: `${Date.now()}`,
        },
      ],
    })),
  updateIdea: (id, updates) =>
    set((state) => ({
      pool: state.pool.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      schedule: Object.fromEntries(
        Object.entries(state.schedule).map(([slotKey, item]) => [slotKey, item?.id === id ? { ...item, ...updates } : item]),
      ),
    })),
  deleteIdea: (id) =>
    set((state) => ({
      pool: state.pool.filter((item) => item.id !== id),
      schedule: Object.fromEntries(
        Object.entries(state.schedule).map(([slotKey, item]) => [slotKey, item?.id === id ? null : item]),
      ),
    })),
  moveItem: (id, destination, slotKey) =>
    set((state) => {
      const item = state.pool.find((entry) => entry.id === id) ?? Object.values(state.schedule).find((entry) => entry?.id === id);
      if (!item) return state;

      const nextPool = state.pool.filter((entry) => entry.id !== id);
      const nextSchedule = { ...state.schedule };

      for (const [key, entry] of Object.entries(nextSchedule)) {
        if (entry?.id === id) {
          nextSchedule[key] = null;
        }
      }

      if (destination === "pool") {
        return { ...state, pool: [...nextPool, item], schedule: nextSchedule };
      }

      if (!slotKey) {
        return state;
      }

      const existing = nextSchedule[slotKey];
      if (existing) {
        nextSchedule[slotKey] = item;
        return {
          ...state,
          pool: [...nextPool, existing],
          schedule: nextSchedule,
        };
      }

      nextSchedule[slotKey] = item;
      return { ...state, pool: nextPool, schedule: nextSchedule };
    }),
  clearSlot: (slotKey) =>
    set((state) => {
      const item = state.schedule[slotKey];
      if (!item) return state;

      return {
        ...state,
        pool: [...state.pool, item],
        schedule: { ...state.schedule, [slotKey]: null },
      };
    }),
}));
