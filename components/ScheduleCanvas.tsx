"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
// Change closestCenter to rectIntersection
import { DndContext, rectIntersection, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useTravelStore } from "@/lib/store";
import { IdeaCard } from "@/components/IdeaCard";
import { CheatSheet } from "@/components/CheatSheet";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

// 1. Update the props definition here
function ScheduleSlot({ slotKey, item, onEdit, onDelete, onReturnToPool }: { slotKey: string; item: any; onEdit: (item: any) => void; onDelete: (slotKey: string) => void; onReturnToPool: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotKey,
    data: { type: "slot", slotKey },
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const openMenu = (x: number, y: number) => {
    setMenuPosition({ x, y });
    setMenuOpen(true);
  };
  const closeMenu = () => {
    setMenuPosition(null);
    setMenuOpen(false);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    openMenu(event.clientX, event.clientY);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    const timer = window.setTimeout(() => {
      openMenu(event.clientX, event.clientY);
    }, 450);
    setPressTimer(timer);
  };

  const handlePointerUpOrLeave = () => {
    if (pressTimer) {
      window.clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && target.closest('[data-context-menu="true"]')) return;
      closeMenu();
    };

    const handleScroll = () => closeMenu();

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menuOpen]);

  return (
    <div
      ref={setNodeRef}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrLeave}
      onPointerLeave={handlePointerUpOrLeave}
      className={`relative min-h-[112px] rounded-2xl border p-2 transition ${isOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white/80"}`}
    >
      {item ? (
        <div className="space-y-2">
          <IdeaCard {...item} compact />
          {menuOpen && menuPosition ? (
            <div
              data-context-menu="true"
              className="fixed z-50 min-w-[120px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
              style={{ left: menuPosition.x, top: menuPosition.y, transform: "translate(-50%, calc(-100% - 8px))" }}
            >
              <button
                type="button"
                onClick={() => {
                  // 2. Fixed this to call onEdit, not onClear
                  onEdit(item); 
                  closeMenu();
                }}
                className="mb-1 block w-full rounded-lg px-2 py-1 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Edit
              </button>
              
              {/* 3. NEW BUTTON: Return to pool */}
              <button
                type="button"
                onClick={() => {
                  onReturnToPool(item.id);
                  closeMenu();
                }}
                className="mb-1 block w-full rounded-lg px-2 py-1 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Return to pool
              </button>

              <button
                type="button"
                onClick={() => {
                  onDelete(slotKey);
                  closeMenu();
                }}
                className="block w-full rounded-lg px-2 py-1 text-left text-sm font-medium text-rose-500 hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
          Drop idea
        </div>
      )}
    </div>
  );
}

export function ScheduleCanvas() {
  const { pool, schedule, moveItem, clearSlot, addIdea, updateIdea, deleteIdea } = useTravelStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", detail: "", meta: "Idea", accent: "#6366f1" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const { setNodeRef: poolRef, isOver: poolIsOver } = useDroppable({
    id: "pool-zone",
    data: { type: "pool" },
  });

  const activeItem = useMemo(() => {
    const fromPool = pool.find((item) => item.id === activeId);
    if (fromPool) return fromPool;
    return Object.values(schedule).find((item) => item?.id === activeId) ?? null;
  }, [activeId, pool, schedule]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

// Inside ScheduleCanvas.tsx, check this call:
const commitIdea = (event?: React.FormEvent | React.MouseEvent) => {
  event?.preventDefault();
  console.log("1. Button clicked! Current draft state:", draft);

  const title = draft.title?.trim();
  if (!title) {
    console.error("2. FAILED: Title is empty, aborting.");
    return;
  }

  const payload = {
    title,
    detail: draft.detail?.trim() || "",
    meta: draft.meta?.trim() || "Idea",
    accent: draft.accent || "#6366f1",
  };

  console.log("3. Payload prepared:", payload);

  if (editingId) {
    updateIdea(editingId, payload);
    setEditingId(null);
  } else {
    console.log("4. Sending to Zustand addIdea...");
    addIdea(payload);
  }

  setDraft({ title: "", detail: "", meta: "Idea", accent: "#6366f1" });
};
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    commitIdea();
  };

  const startEditing = (item: { id: string; title: string; detail: string; meta: string; accent: string }) => {
    setEditingId(item.id);
    setDraft({ title: item.title, detail: item.detail, meta: item.meta, accent: item.accent });
    setMenuItemId(null);
  };

  const openPoolMenu = (id: string, x: number, y: number) => {
    setMenuItemId(id);
    setMenuPosition({ x, y });
  };

  const closePoolMenu = () => {
    setMenuItemId(null);
    setMenuPosition(null);
  };

  useEffect(() => {
    if (!menuItemId) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && target.closest('[data-context-menu="true"]')) return;
      closePoolMenu();
    };

    const handleScroll = () => closePoolMenu();

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menuItemId]);

const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // DEBUG LOG: See exactly where the item was dropped
    console.log("Dropped! Over:", over?.id, "Data:", over?.data.current);

    if (!over) {
      console.log("Missed all drop zones!");
      return;
    }

    const draggedId = active.id as string;
    const overType = over.data.current?.type;

    if (overType === "slot") {
      moveItem(draggedId, "schedule", over.data.current?.slotKey as string);
      return;
    }

    if (overType === "pool") {
      moveItem(draggedId, "pool");
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)] sm:p-6 lg:p-7">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Weekly Planner</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">A large timetable for the week</h2>
        </div>
        <div className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
          Seoul • 7-day view
        </div>
      </div>

      <DndContext
      id="dnd-context-drift" //
        sensors={sensors}
        // closestCenter keeps the active card aligned to the nearest drop zone for better accuracy on dense weekly cells.
       collisionDetection={rectIntersection} //
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Idea pool</h3>
              <span className="text-xs text-slate-400">Left side</span>
            </div>
            <form onSubmit={handleSubmit} className="mb-3 space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="New idea"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                aria-label="Idea title"
              />
              <textarea
                value={draft.detail}
                onChange={(event) => setDraft((current) => ({ ...current, detail: event.target.value }))}
                placeholder="Details"
                className="min-h-[72px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                aria-label="Idea details"
              />
              <div className="flex items-center gap-2">
                <input
                  value={draft.meta}
                  onChange={(event) => setDraft((current) => ({ ...current, meta: event.target.value }))}
                  placeholder="Tag"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  aria-label="Idea tag"
                />
                <input
                  type="color"
                  value={draft.accent}
                  onChange={(event) => setDraft((current) => ({ ...current, accent: event.target.value }))}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-transparent"
                  aria-label="Idea accent color"
                />
              </div>
              <button
                type="button"
                onClick={() => commitIdea()}
                className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {editingId ? "Save idea" : "Add idea"}
              </button>
            </form>
            <div
          ref={poolRef}
  // Make sure this div has layout bounds that dnd-kit can measure reliably
  className={`relative min-h-[400px] w-full rounded-2xl border border-dashed p-3 transition ${poolIsOver ? "border-indigo-400 bg-indigo-100" : "border-slate-200 bg-white/70"}`}
            >
              <div className="space-y-3">
                {pool.map((item) => (
                  <motion.div key={item.id} layout>
                    <div
                      className="space-y-2"
                      onContextMenu={(event) => {
                        event.preventDefault();
                        openPoolMenu(item.id, event.clientX, event.clientY);
                      }}
                      onPointerDown={(event) => {
                        const timer = window.setTimeout(() => openPoolMenu(item.id, event.clientX, event.clientY), 450);
                        window.setTimeout(() => window.clearTimeout(timer), 1000);
                      }}
                    >
                      <IdeaCard {...item} />
                      {menuItemId === item.id && menuPosition ? (
                        <div
                          data-context-menu="true"
                          className="fixed z-50 min-w-[120px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                          style={{ left: menuPosition.x, top: menuPosition.y, transform: "translate(-50%, calc(-100% - 8px))" }}
                        >
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            className="mb-1 block w-full rounded-lg px-2 py-1 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteIdea(item.id);
                              closePoolMenu();
                            }}
                            className="block w-full rounded-lg px-2 py-1 text-left text-sm font-medium text-rose-500 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Drag ideas here first, then drop them into the week timetable once they are official.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[90px_repeat(7,minmax(0,1fr))] gap-2">
                <div />
                {days.map((day) => (
                  <div key={day} className="rounded-2xl bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm">
                    {day}
                  </div>
                ))}

                {times.map((time) => (
                  <Fragment key={time}>
                    <div className="pt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{time}</div>
                    {days.map((day) => {
                      const slotKey = `${day}-${time}`;
                      const item = schedule[slotKey];
                      return (
  <ScheduleSlot 
    key={slotKey} 
    slotKey={slotKey} 
    item={item} 
    onEdit={startEditing} // Pass your startEditing function here
    onDelete={clearSlot} 
    onReturnToPool={(id) => moveItem(id, "pool")} //
  />
);
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DragOverlay>{activeItem ? <IdeaCard {...activeItem} compact /> : null}</DragOverlay>
      </DndContext>

      <CheatSheet />
    </section>
  );
}
