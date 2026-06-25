"use client";

import { motion } from "framer-motion";
import { ScheduleCanvas } from "@/components/ScheduleCanvas";

export function DriftDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-[28px] border border-slate-200 bg-white/80 px-5 py-5 shadow-sm backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Drift</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Your chic Seoul itinerary,
                <span className="block text-slate-500">made calm and clear.</span>
              </h1>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Share itinerary"
            >
              Share plan
            </motion.button>
          </div>
        </header>

        <ScheduleCanvas />
      </div>
    </main>
  );
}
