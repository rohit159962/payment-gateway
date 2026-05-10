"use client";
import { useEffect, useRef } from "react";
import { PaymentStatus, Currency } from "@/types";
import { formatCurrency } from "@/utils/format";
import { MAX_PAYMENT_RETRIES } from "@/store/paymentStore";

interface Props {
  status: Exclude<PaymentStatus, "idle" | "processing">;
  message: string;
  attempt: number;
  amount: string;
  currency: Currency;
  transactionId: string;
  onRetry: () => void;
  onReset: () => void;
}

const CONFIG = {
  success: {
    icon: "✓",
    title: "Payment Successful",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    iconBg: "bg-emerald-500/15",
  },
  failed: {
    icon: "✕",
    title: "Payment Failed",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    iconBg: "bg-red-500/15",
  },
  timeout: {
    icon: "⏱",
    title: "Request Timed Out",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    iconBg: "bg-amber-500/15",
  },
};

export function StatusScreen({
  status, message, attempt, amount, currency,
  transactionId, onRetry, onReset,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const c = CONFIG[status];
  const canRetry = attempt < MAX_PAYMENT_RETRIES;

  // Manage focus after state transition
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className={`rounded-2xl p-8 text-center border ${c.bg} ${c.border} outline-none`}
    >
      <div className={`w-16 h-16 rounded-full ${c.iconBg} border ${c.border} flex items-center justify-center mx-auto mb-5 text-2xl ${c.color}`}>
        {c.icon}
      </div>

      <h2 className="text-xl font-extrabold text-slate-100 mb-2">{c.title}</h2>

      <p className="text-sm text-slate-400 mb-1">
        {status === "success"
          ? `${formatCurrency(amount, currency)} was charged successfully.`
          : message || "Something went wrong."}
      </p>

      {/* Transaction ID */}
      <p className="text-xs font-mono text-slate-600 mb-5 break-all px-4">
        {transactionId}
      </p>

      {/* Attempt counter */}
      {status !== "success" && (
        <div className="mb-5">
          <p className="text-xs text-slate-500 mb-2">
            Attempt {attempt} of {MAX_PAYMENT_RETRIES}
          </p>
          <div className="flex gap-1.5 justify-center">
            {[...Array(MAX_PAYMENT_RETRIES)].map((_, i) => (
              <div
                key={i}
                className={`h-1 w-12 rounded-full transition-colors duration-300 ${
                  i < attempt ? "bg-violet-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2.5 justify-center flex-wrap">
        {status !== "success" && canRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
          >
            Retry Payment
          </button>
        )}
        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-xl bg-white/7 text-slate-400 border border-white/10 font-semibold text-sm cursor-pointer hover:bg-white/10 transition-colors"
        >
          New Payment
        </button>
      </div>

      {status !== "success" && !canRetry && (
        <p className="mt-4 text-xs text-red-400">
          Maximum retries reached. Please start a new payment or contact support.
        </p>
      )}
    </div>
  );
}