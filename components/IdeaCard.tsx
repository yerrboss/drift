"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";

type IdeaCardProps = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  accent: string;
  compact?: boolean;
};

export function IdeaCard({ id, title, detail, meta, accent, compact = false }: IdeaCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: "idea", item: { id, title, detail, meta, accent } },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full rounded-2xl border text-left shadow-sm ${compact ? "border-indigo-200 bg-indigo-50/80 p-3" : "border-slate-200 bg-white p-4"} ${isDragging ? "opacity-70" : ""}`}
      {...attributes}
      {...listeners}
      aria-label={`Draggable idea card ${title}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">{meta}</span>
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {!compact ? <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p> : null}
    </motion.button>
  );
}
