import { create } from "zustand";

type TravelItem = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  accent: string;
  duration?: number;
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
    duration: 120, // 2 hours
  },
 {
    id: "2",
    title: "Hanok district walk",
    detail: "Pause at a tea house and collect local texture.",
    meta: "Culture",
    accent: "#0f172a",
    duration: 90, // 1.5 hours
  },
  {
    id: "3",
    title: "Late-night ramen crawl",
    detail: "Keep the evening light and warm with a small circuit.",
    meta: "Night",
    accent: "#475569",
    duration: 60, // 1 hour
  },
];

export const useTravelStore = create<TravelState>((set) => ({
  pool: initialPool,
  schedule: {},
// Replace your existing addIdea function with this:
addIdea: (idea) =>
    set((state) => {
      console.log("5. Zustand received idea!", idea);
      console.log("6. Previous pool size:", state.pool.length);
      
      const newPool = [
        ...state.pool,
        { ...idea, id: crypto.randomUUID() },
      ];
      
      console.log("7. New pool size will be:", newPool.length);
      return { pool: newPool };
    }),
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
// Update your moveItem in lib/store.ts
moveItem: (id: string, targetZone: "pool" | "schedule", slotKey?: string, duration?: number) => set((state: any) => {
  const item = state.pool.find((i: any) => i.id === id) || 
               Object.values(state.schedule).find((i: any) => i?.id === id);
  
  if (!item) return state;

  // If duration is provided (initial drop), update the item's duration
  const updatedItem = duration ? { ...item, duration } : item;

  const newPool = state.pool.filter((i: any) => i.id !== id);
  const newSchedule = { ...state.schedule };
  
  // Scrub ghost
  for (const key in newSchedule) {
    if (newSchedule[key]?.id === id) delete newSchedule[key];
  }

  if (targetZone === "pool") {
    return { pool: [...newPool, updatedItem], schedule: newSchedule };
  } else if (targetZone === "schedule" && slotKey) {
    return { pool: newPool, schedule: { ...newSchedule, [slotKey]: updatedItem } };
  }
  return state;
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
