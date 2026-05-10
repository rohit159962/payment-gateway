import { Transaction } from "@/types";
import { formatCurrency } from "@/utils/format";

interface Props {
  tx: Transaction;
  onClose: () => void;
}

export function TransactionDetail({ tx, onClose }: Props) {
  const rows: [string, string | number][] = [
    ["Transaction ID", tx.id],
    ["Amount", formatCurrency(tx.amount, tx.currency)],
    ["Status", tx.status],
    ["Message", tx.message || "—"],
    ["Last 4 digits", tx.last4 ? `•••• ${tx.last4}` : "—"],
    ["Attempts", tx.attempts],
    ["Date", new Date(tx.timestamp).toLocaleString()],
  ];

  return (
    <div className="mt-2 bg-white/3 border border-white/7 rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-200">Transaction Detail</h3>
        <button
          onClick={onClose}
          aria-label="Close detail"
          className="text-slate-500 hover:text-slate-300 text-lg leading-none cursor-pointer"
        >
          ×
        </button>
      </div>
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-slate-200 font-semibold text-right max-w-[60%] break-all">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}