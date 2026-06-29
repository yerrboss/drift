"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  rectIntersection,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useTravelStore } from "@/lib/store";
import { IdeaCard } from "@/components/IdeaCard";
import { CheatSheet } from "@/components/CheatSheet";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

// 1. The new HalfSlot represents a 1-hour drop zone (56px tall)
// 1. The new HalfSlot represents a 1-hour drop zone (56px tall)
function HalfSlot({ slotKey, item, onResize, onContextMenu, className, hidePlaceholder }: any) {
  const { setNodeRef } = useDroppable({ id: slotKey, data: { type: "slot", slotKey } });

  return (
    <div
      ref={setNodeRef}
      className={className}
      onContextMenu={(e) => {
        if (item && onContextMenu) {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(e, item.id);
        }
      }}
    >
      {item ? (
        <div className="relative w-full">
          <IdeaCard
            {...item}
            compact
            // 👇 ADD THIS LINE SO THE CARD KNOWS WHEN IT STARTS
            startTime={slotKey.split('-')[1]} 
            onResizeEnd={(d: number) => onResize(item.id, d)}
          />
        </div>
      ) : (
        !hidePlaceholder && (
          <div className="flex h-full w-full items-center justify-center p-1">
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-400 opacity-60 transition-opacity hover:opacity-100">
              Drop
            </div>
          </div>
        )
      )}
    </div>
  );
}

// 2. The Wrapper keeps the 2-hour (112px) block intact to prevent CSS grid breaking
function TwoHourBlock({ day, time, schedule, onResize, onContextMenu }: any) {
  // Time math to get the bottom half hour (e.g., 10:00 -> 11:00)
  const [h] = time.split(":");
  const bottomTime = `${String(parseInt(h) + 1).padStart(2, "0")}:00`;

  const topKey = `${day}-${time}`;
  const bottomKey = `${day}-${bottomTime}`;

  const topItem = schedule[topKey];
  const bottomItem = schedule[bottomKey];

  const isEmpty = !topItem && !bottomItem;

  return (
    <div className="relative h-[112px] w-full rounded-2xl border border-slate-200 bg-white/80 z-0">
      {/* Background Placeholder when fully empty */}
      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
          <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
            Drop idea
          </div>
        </div>
      )}

      {/* Center dashed line for visual half when an item is placed */}
      {!isEmpty && (
        <div className="pointer-events-none absolute top-[56px] left-0 right-0 z-0 border-t border-dashed border-slate-200" />
      )}

      {/* Top Slot (e.g., 10:00) - Higher z-index so a 2-hour card covers the bottom slot */}
      <HalfSlot
        slotKey={topKey}
        item={topItem}
        onResize={onResize}
        onContextMenu={onContextMenu}
        className="absolute left-0 right-0 top-0 z-20 h-[56px]"
        hidePlaceholder={isEmpty}
      />

      {/* Bottom Slot (e.g., 11:00) */}
      <HalfSlot
        slotKey={bottomKey}
        item={bottomItem}
        onResize={onResize}
        onContextMenu={onContextMenu}
        className="absolute bottom-0 left-0 right-0 z-10 h-[56px]"
        hidePlaceholder={isEmpty}
      />
    </div>
  );
}

export function ScheduleCanvas() {
  const {
    pool,
    schedule,
    moveItem,
    clearSlot,
    addIdea,
    updateIdea,
    deleteIdea,
  } = useTravelStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    detail: "",
    meta: "Idea",
    accent: "#6366f1",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const { setNodeRef: poolRef, isOver: poolIsOver } = useDroppable({
    id: "pool-zone",
    data: { type: "pool" },
  });

  const activeItem = useMemo(() => {
    const fromPool = pool.find((item) => item.id === activeId);
    if (fromPool) return fromPool;
    return Object.values(schedule).find((item) => item?.id === activeId) ?? null;
  }, [activeId, pool, schedule]);

  const menuItem = useMemo(() => {
    if (!menuItemId) return null;
    const fromPool = pool.find((item) => item.id === menuItemId);
    if (fromPool) return fromPool;
    return Object.values(schedule).find((item) => item?.id === menuItemId) ?? null;
  }, [menuItemId, pool, schedule]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const commitIdea = (event?: React.FormEvent | React.MouseEvent) => {
    event?.preventDefault();

    const title = draft.title?.trim();
    if (!title) return;

    const payload = {
      title,
      detail: draft.detail?.trim() || "",
      meta: draft.meta?.trim() || "Idea",
      accent: draft.accent || "#6366f1",
    };

    if (editingId) {
      updateIdea(editingId, payload);
      setEditingId(null);
    } else {
      addIdea(payload);
    }

    setDraft({ title: "", detail: "", meta: "Idea", accent: "#6366f1" });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    commitIdea();
  };

  const startEditing = (item: { id: string; title: string; detail: string; meta: string; accent: string; }) => {
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
    const draggedId = active.id as string;

    // 1. If dropping onto a specific schedule slot
    if (over && over.data.current?.type === "slot") {
      moveItem(draggedId, "schedule", over.data.current?.slotKey as string);
      return;
    }

    // 2. THE AGGRESSIVE FIX: 
    // If dropped ANYWHERE else (the pool, on top of another card, or outside the boxes)
    // it will automatically rip it off the schedule and return it to the pool.
    moveItem(draggedId, "pool");
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
        id="dnd-context-drift"
        sensors={sensors}
        collisionDetection={rectIntersection}
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
                        const timer = window.setTimeout(
                          () => openPoolMenu(item.id, event.clientX, event.clientY),
                          450,
                        );
                        window.setTimeout(() => window.clearTimeout(timer), 1000);
                      }}
                    >
                      <IdeaCard {...item} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Drag ideas here first, then drop them into the week timetable once
              they are official.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[90px_repeat(7,minmax(0,1fr))] gap-2 grid-flow-dense">
                <div />
                {days.map((day) => (
                  <div key={day} className="rounded-2xl bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm">
                    {day}
                  </div>
                ))}

{/* 1. Add rowIndex to the map function */}
                {times.map((time, rowIndex) => {
                  const isHalfHour = time.endsWith(":30");

                  return (
                    <Fragment key={time}>
                      <div className="relative pt-2 pr-2 text-right">
                        {!isHalfHour && (
                          <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400">
                            {time}
                          </span>
                        )}
                      </div>

                      {days.map((day) => {
                        return (
                          <div 
                            key={`${day}-${time}`} 
                            className="relative"
                            // 2. THIS IS THE MAGIC FIX: Higher rows get higher z-index
                            style={{ zIndex: 100 - rowIndex }} 
                          >
                            <TwoHourBlock
                              day={day}
                              time={time}
                              schedule={schedule}
                              onResize={(id: string, newDuration: number) => updateIdea(id, { duration: newDuration })}
                              onContextMenu={(e: React.MouseEvent, id: string) => openPoolMenu(id, e.clientX, e.clientY)}
                            />
                          </div>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {menuItem && menuPosition && (
          <div
            data-context-menu="true"
            className="fixed z-[100] min-w-[120px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
            style={{
              left: menuPosition.x,
              top: menuPosition.y,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
          >
            <button
              type="button"
              onClick={() => {
                startEditing(menuItem);
                closePoolMenu();
              }}
              className="mb-1 block w-full rounded-lg px-2 py-1 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                deleteIdea(menuItem.id);
                closePoolMenu();
              }}
              className="block w-full rounded-lg px-2 py-1 text-left text-sm font-medium text-rose-500 hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        )}

        <DragOverlay>
          {activeItem ? <IdeaCard {...activeItem} compact /> : null}
        </DragOverlay>
      </DndContext>

      <CheatSheet />
    </section>
  );
}