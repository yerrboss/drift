"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Tooltip } from "./Tooltip";

type IdeaCardProps = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  accent: string;
  compact?: boolean;
  duration?: number;
  startTime?: string; // Added to receive the starting time
  onResizeEnd?: (newDuration: number) => void;
};

const ROW_HEIGHT = 112;
const PIXELS_PER_MINUTE = ROW_HEIGHT / 120;
const MIN_DURATION = 30;

export function IdeaCard({ id, title, detail, meta, accent, compact = false, duration = 60, startTime, onResizeEnd }: IdeaCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: "idea", item: { id, title, detail, meta, accent, duration } },
  });

  const [localHeight, setLocalHeight] = useState(duration * PIXELS_PER_MINUTE);
  const [endTime, setEndTime] = useState<string | null>(null);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  useEffect(() => {
    setLocalHeight(duration * PIXELS_PER_MINUTE);
  }, [duration]);

  // Calculate End Time based on current pixel height
  useEffect(() => {
    if (compact && startTime) {
      const currentMinutes = Math.round(localHeight / PIXELS_PER_MINUTE);
      const [h, m] = startTime.split(':').map(Number);
      const d = new Date(2026, 0, 1, h, m);
      d.setMinutes(d.getMinutes() + currentMinutes);
      setEndTime(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
  }, [compact, startTime, localHeight]);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = localHeight;
    document.body.style.cursor = "ns-resize";
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isResizing.current) return;
    const deltaY = e.clientY - startY.current;
    const newHeight = Math.max(MIN_DURATION * PIXELS_PER_MINUTE, startHeight.current + deltaY);
    setLocalHeight(newHeight);
  };

  const handlePointerUp = () => {
    if (!isResizing.current) return;
    isResizing.current = false;
    document.body.style.cursor = "";

    const rawDuration = localHeight / PIXELS_PER_MINUTE;
    const snappedDuration = Math.max(MIN_DURATION, Math.round(rawDuration / 30) * 30);
    
    setLocalHeight(snappedDuration * PIXELS_PER_MINUTE);
    if (onResizeEnd) onResizeEnd(snappedDuration);
  };

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [localHeight]);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      title={title}
      animate={{ height: compact ? localHeight : "auto" }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
      whileTap={!isResizing.current ? { scale: 0.98 } : undefined}
      className={`rounded-2xl border text-left shadow-sm ${
        compact
          ? "absolute left-0 right-0 top-0 z-20 flex flex-col overflow-hidden border-indigo-200 bg-indigo-50 p-3"
          : "relative w-full border-slate-200 bg-white p-4"
      } ${isDragging ? "z-50 opacity-70 shadow-lg" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        <span className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
          {compact ? `${Math.round(localHeight / PIXELS_PER_MINUTE)}m` : meta}
        </span>
      </div>
      <h3 className={`font-semibold text-slate-800 ${compact ? "line-clamp-2 text-xs" : "text-sm"}`}>{title}</h3>
      {!compact ? <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p> : null}

      {/* The subtle End Time text */}
      {compact && endTime && (
        <span className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-medium text-slate-400/80 pointer-events-none">
          Ends {endTime}
        </span>
      )}

      {compact && (
        <div
          onPointerDown={handlePointerDown}
          className="absolute bottom-0 left-0 right-0 flex h-5 cursor-ns-resize items-end justify-center pb-1 opacity-0 transition-opacity hover:opacity-100"
        >
          <div className="h-1.5 w-8 rounded-full bg-indigo-300" />
        </div>
      )}
    </motion.div>
  );
}