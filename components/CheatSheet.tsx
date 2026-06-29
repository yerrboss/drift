"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const guideData = [
  {
    id: "apps",
    title: "Essential 'Must-Have' Apps",
    icon: "📱",
    content: (
      <ul className="space-y-3 text-sm text-slate-600">
        <li><strong className="text-slate-900">Navigation:</strong> Naver Map or KakaoMap. The gold standard for walking and transit. Google Maps is heavily restricted here.</li>
        <li><strong className="text-slate-900">Translation:</strong> Papago. Developed by Naver, it handles Korean nuances and honorifics far better than Google Translate. Use the camera feature for menus.</li>
        <li><strong className="text-slate-900">Transport:</strong> Kakao T. The local Uber equivalent. Reliable, upfront pricing, and tracking.</li>
        <li><strong className="text-slate-900">Dining:</strong> Catchtable Global. Book popular spots or join digital waitlists without needing a Korean phone number.</li>
      </ul>
    ),
  },
  {
    id: "transit",
    title: "Transportation Hacks",
    icon: "🚇",
    content: (
      <ul className="space-y-3 text-sm text-slate-600">
        <li><strong className="text-slate-900">T-Money Card:</strong> Non-negotiable for subways and buses. Get a physical one at a convenience store, or use the Mobile T-money app (Foreigner mode).</li>
        <li><strong className="text-slate-900">Bus Tap Rule:</strong> Always tap your card when boarding <em>and</em> when getting off. This prevents maximum distance charges and unlocks free transfers.</li>
        <li><strong className="text-slate-900">Climate Card:</strong> Staying a while? Look into Seoul's unlimited transit pass which even includes city bikes.</li>
      </ul>
    ),
  },
  {
    id: "payments",
    title: "Payments & Currency",
    icon: "💳",
    content: (
      <ul className="space-y-3 text-sm text-slate-600">
        <li><strong className="text-slate-900">The WOWPASS:</strong> A game-changer. It acts as a prepaid Visa and T-money card. Top it up with your home currency at subway kiosks to bypass bad exchange rates.</li>
        <li><strong className="text-slate-900">Cash for Street Food:</strong> Korea is highly cashless, but keep 30k–50k KRW on hand for Gwangjang Market stalls or reloading physical transit cards.</li>
      </ul>
    ),
  },
  {
    id: "shopping",
    title: "Shopping & Tax Refunds",
    icon: "🛍️",
    content: (
      <ul className="space-y-3 text-sm text-slate-600">
        <li><strong className="text-slate-900">Instant Tax-Free:</strong> Always carry your physical passport. Olive Young, Daiso, and department stores offer "Immediate Tax Refund" at the register for purchases over 30,000 KRW, saving you an airport headache.</li>
      </ul>
    ),
  },
  {
    id: "culture",
    title: "Quick Cultural Nuance",
    icon: "🙇🏻",
    content: (
      <ul className="space-y-3 text-sm text-slate-600">
        {/* <li><strong className="text-slate-900">The Two-Hand Rule:</strong> When handing over or receiving items (cards, receipts, drinks), use two hands or touch your left hand to your right elbow as a sign of respect.</li> */}
        {/* <li><strong className="text-slate-900">Cafe Trust:</strong> Laptops and phones left on tables is normal. Locals use them to reserve seats. Theft is incredibly rare.</li> */}
        <li><strong className="text-slate-900">Table Buttons:</strong> Use the call button on your table to summon a server. It's highly efficient and not considered rude.</li>
        <li><strong className="text-slate-900">Trash Bins:</strong> Public bins are rare. Carry a small bag in your daypack for your own trash until you reach a subway station.</li>
      </ul>
    ),
  },

  {
    id: "neighborhoods",
    title: "Neighborhood Hacks",
    icon: "🗺️",
    content: (
      <ul className="space-y-3 text-sm text-slate-600">
        <li><strong className="text-slate-900">Seochon over Samcheong-dong:</strong> After visiting Gyeongbokgung Palace, skip the crowded east side and head out the west gate to Seochon. It has a much more authentic mix of old alleys and chic cafes.</li>
        <li><strong className="text-slate-900">Tongin Market Lunchbox:</strong> Located in Seochon, you can exchange your cash for traditional brass coins (Yeopjeon) to build your own custom lunchbox from the various vendors.</li>
        <li><strong className="text-slate-900">Pop-Up Hunting in Seongsu:</strong> Seongsu-dong is the trendiest district right now. Global and local brands host incredible, highly-stylized (and usually free) pop-up stores almost every week along Yeonmujang-gil.</li>
      </ul>
    ),
  },
  {
    id: "food",
    title: "Food & Drink Secrets",
    icon: "🍜",
    content: (
      <ul className="space-y-3 text-sm text-slate-600">
        <li><strong className="text-slate-900">Mangwon Market:</strong> Gwangjang Market is famous from Netflix, but Mangwon Market is where locals actually go for cheaper, highly authentic street food (try the giant stuffed chili peppers!).</li>
        <li><strong className="text-slate-900">The Hangang Ramen Ritual:</strong> Head to a convenience store at the Han River park, buy a foil bowl and instant ramen, and cook it on the outdoor automated machines. Eat it on a picnic mat by the water like a local.</li>
        <li><strong className="text-slate-900">The Bakery Boom:</strong> Seoul's pastry scene is currently exploding. Cult favorites like London Bagel Museum or any cafe specializing in "salt bread" will have lines, but they are a massive part of modern Korean food culture.</li>
      </ul>
    ),
  }
];

function AccordionItem({ item, isOpen, onClick }: { item: any; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-indigo-200">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between bg-white px-5 py-4 text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-lg">
            {item.icon}
          </span>
          <span className="font-semibold text-slate-800">{item.title}</span>
        </div>
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
            isOpen ? "border-indigo-200 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-slate-50 text-slate-400"
          }`}
        >
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </motion.svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 pb-5 pt-4">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CheatSheet() {
  const [openId, setOpenId] = useState<string | null>("apps");

  // 1. Split the data into two permanent columns
  const leftColumn = guideData.filter((_, index) => index % 2 === 0);
  const rightColumn = guideData.filter((_, index) => index % 2 !== 0);

  return (
    <section className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-6 lg:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Survival Guide</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">Local Knowledge Base</h2>
        <p className="mt-2 text-sm text-slate-500">Everything you need to know before touching down at Incheon.</p>
      </div>

      {/* 2. Use a standard grid with items-start to prevent stretching */}
      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        
        {/* Left Column Container */}
        <div className="flex flex-col gap-4">
          {leftColumn.map((item) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>

        {/* Right Column Container */}
        <div className="flex flex-col gap-4">
          {rightColumn.map((item) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}