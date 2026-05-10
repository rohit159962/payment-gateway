"use client";
import { useState } from "react";
import { Transaction } from "@/types";
import { formatCurrency, timeAgo } from "@/utils/format";
import { TransactionDetail } from "./TransactionDetail";

interface Props {
  transactions: Transaction[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  success: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  failed:  { bg: "bg-red-500/15",     text: "text-red-400",     dot: "bg-red-400"     },
  timeout: { bg: "bg-amber-500/15",   text: "text-amber-400",   dot: "bg-amber-400"   },
};

export function TransactionHistory({ transactions }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTx = transactions.find((t) => t.id === selectedId) ?? null;

  if (!transactions.length) {
    return (
      <p className="text-center text-slate-600 py-10 text-sm">No transactions yet.</p>
    );
  }

  return (
    <div className="space-y-2.5 cursor-pointer">
   {transactions.map((tx) => {
  const s = STATUS_STYLES[tx.status] ?? STATUS_STYLES.failed;
  const isSelected = selectedId === tx.id;

  return (
    <div key={tx.id} className="space-y-2">
      <button
        onClick={() =>
          setSelectedId((prev) => (prev === tx.id ? null : tx.id))
        }
        className={[
          "w-full text-left rounded-xl p-3.5 border transition-all",
          isSelected
            ? "bg-violet-500/10 border-violet-500/35"
            : "bg-white/3 border-white/7 hover:bg-white/5",
        ].join(" ")}
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-xs text-slate-500">
            {tx.id.slice(0, 8)}…
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${s.bg} ${s.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {tx.status.toUpperCase()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-100">
            {formatCurrency(tx.amount, tx.currency)}
          </span>

          <span className="text-xs text-slate-600">
            {timeAgo(tx.timestamp)}
          </span>
        </div>
      </button>

      {isSelected && (
        <div className="animate-in fade-in duration-200">
          <TransactionDetail
            tx={tx}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  );
})}

    </div>
  );
}