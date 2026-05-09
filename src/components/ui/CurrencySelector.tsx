"use client";
import { useState } from "react";
import { Currency } from "@/types";

const CURRENCIES: { code: Currency; symbol: string; flag: string }[] = [
  { code: "INR", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
];

interface Props {
  value: Currency;
  onChange: (c: Currency) => void;
}

export function CurrencySelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = CURRENCIES.find((c) => c.code === value)!;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-slate-100 cursor-pointer hover:bg-white/10 transition-all"
      >
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <span className="text-xs opacity-50">▾</span>
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-[#131825] border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[110px]">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onChange(c.code); setOpen(false); }}
              className={[
                "flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-left transition-colors",
                value === c.code ? "bg-violet-500/20 text-violet-300" : "text-slate-300 hover:bg-white/5",
              ].join(" ")}
            >
              <span>{c.flag}</span>
              <span className="font-semibold">{c.code}</span>
              <span className="text-slate-500 text-xs">{c.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}