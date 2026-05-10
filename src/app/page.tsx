"use client";
import { useState } from "react";
import { CardInput } from "@/components/CardInput";
import { StatusScreen } from "@/components/StatusScreen";
import { TransactionHistory } from "@/components/TransactionHistory";
import { usePaymentStore, MAX_PAYMENT_RETRIES } from "@/store/paymentStore";
import { usePayment } from "@/hooks/usePayment";

export default function Home() {
  const [tab, setTab] = useState<"pay" | "history">("pay");
  const { status, message, transactionId, attempt, transactions, reset } =
    usePaymentStore();

    const { retryPayment } = usePayment({
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
  currency: "INR",
});

  const isResult = ["success", "failed", "timeout"].includes(status);
  const isProcessing = status === "processing";

  return (
    <main className="min-h-screen bg-[#080c14] text-slate-200 flex items-start justify-center p-6"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 20% 20%, rgba(88,28,220,0.07), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(30,60,120,0.08), transparent 50%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-violet-900/40">
              ⬡
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Ready Pay</span>
          </div>
          <p className="text-xs text-slate-600 tracking-widest">Secure · Encrypted · Instant</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/4 border border-white/6 rounded-xl p-1 mb-6">
          {(["pay", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer",
                tab === t
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-slate-500 hover:text-slate-400",
              ].join(" ")}
            >
              {t === "pay" ? "💳 Payment" : `📋 History${transactions.length ? ` (${transactions.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-5 items-start">

          {/* Left panel */}
          <div className="bg-white/[0.025] border border-white/7 rounded-2xl p-6">
            {tab === "pay" ? (
              <>
                {/* Processing overlay */}
                {isProcessing && (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-bold text-base mb-1">Processing Payment</p>
                    <p className="text-xs text-slate-600 animate-pulse">Please do not close this window…</p>
                  </div>
                )}

                {/* Result screen */}
                {isResult && transactionId && (
                  <StatusScreen
                    status={status as "success" | "failed" | "timeout"}
                    message={message}
                    attempt={attempt}
                    amount={usePaymentStore.getState().transactions.find(t => t.id === transactionId)?.amount ?? ""}
                    currency={usePaymentStore.getState().transactions.find(t => t.id === transactionId)?.currency ?? "INR"}
                    transactionId={transactionId}
                    onRetry={() => retryPayment(transactionId, attempt)}
                    onReset={reset}
                  />
                )}

                {/* Idle — show card form */}
                {status === "idle" && <CardInput />}
              </>
            ) : (
              <>
                <h2 className="text-sm font-bold text-slate-200 mb-4">Transaction History</h2>
                <div className="max-h-[440px] overflow-y-auto pr-1">
                  <TransactionHistory transactions={transactions} />
                </div>
              </>
            )}
          </div>

          {/* Right panel — always shows the form inputs or summary */}
          <div className="bg-white/[0.025] border border-white/7 rounded-2xl p-6">
            {status === "idle" ? (
              <p className="text-xs text-slate-600 text-center pt-4">
                Fill in your card details on the left to proceed.
              </p>
            ) : transactionId ? (
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest uppercase text-slate-500">Transaction</p>
                <p className="font-mono text-xs text-slate-600 break-all">{transactionId}</p>
                {/* Attempt bar */}
                {attempt > 0 && status !== "success" && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Attempt {attempt} / {MAX_PAYMENT_RETRIES}</p>
                    <div className="flex gap-1.5">
                      {[...Array(MAX_PAYMENT_RETRIES)].map((_, i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < attempt ? "bg-violet-500" : "bg-white/10"}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}