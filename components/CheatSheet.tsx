"use client";

const tips = [
  { title: "Naver Maps", detail: "Best for Seoul transit and walking routes.", accent: "bg-indigo-500" },
  { title: "eSIM", detail: "Activate before boarding for instant connectivity.", accent: "bg-slate-700" },
  { title: "T-Money", detail: "Use for subway, buses, and convenience stores.", accent: "bg-slate-500" },
  { title: "1330 Helpline", detail: "English support for travelers in need.", accent: "bg-indigo-400" },
];

export function CheatSheet() {
  return (
    <section className="mt-5 rounded-3xl border border-slate-200 bg-slate-100/70 p-4 shadow-sm" aria-label="Visitor cheat sheet">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Visitor Cheat Sheet</p>
          <h3 className="text-base font-semibold text-slate-800">Essential moves in Seoul</h3>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {tips.map((tip) => (
          <article key={tip.title} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <div className={`mb-2 h-2 w-10 rounded-full ${tip.accent}`} />
            <h4 className="text-sm font-semibold text-slate-800">{tip.title}</h4>
            <p className="mt-1 text-sm leading-6 text-slate-500">{tip.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
