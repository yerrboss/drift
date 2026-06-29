export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Drift</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">This page is not available</h1>
        <p className="mt-2 text-sm text-slate-500">Return to the planner and keep building your trip.</p>
      </div>
    </main>
  );
}
