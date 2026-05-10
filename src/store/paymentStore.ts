import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PaymentStatus, Transaction, PaymentPayload } from "@/types";

const MAX_RETRIES = 3;

interface PaymentStore {
  // State
  status: PaymentStatus;
  message: string;
  transactionId: string | null;
  attempt: number;
  transactions: Transaction[];
  lastPayload: PaymentPayload | null;

  // Actions
  startProcessing: (txId: string) => void;
  setSuccess: (txId: string, message: string) => void;
  setFailed: (txId: string, message: string) => void;
  setTimeout: (txId: string) => void;
  incrementAttempt: () => void;
  reset: () => void;
  upsertTransaction: (tx: Transaction) => void;
  setLastPayload: (payload: PaymentPayload) => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      status: "idle",
      message: "",
      transactionId: null,
      attempt: 0,
      transactions: [],

      startProcessing: (txId) =>
        set({ status: "processing", transactionId: txId, message: "" }),

      setSuccess: (txId, message) => set({ status: "success", message }),

      setFailed: (_txId, message) => set({ status: "failed", message }),

      setTimeout: (_txId) =>
        set({ status: "timeout", message: "Request timed out." }),

      incrementAttempt: () => set((s) => ({ attempt: s.attempt + 1 })),

      lastPayload: null,

      setLastPayload: (payload) =>
        set({
          lastPayload: payload,
        }),

      reset: () =>
        set({ status: "idle", message: "", transactionId: null, attempt: 0 }),

      upsertTransaction: (tx) =>
        set((s) => {
          const exists = s.transactions.some((t) => t.id === tx.id);
          const next = exists
            ? s.transactions.map((t) => (t.id === tx.id ? { ...t, ...tx } : t))
            : [tx, ...s.transactions];
          return { transactions: next };
        }),
    }),
    {
      name: "pg_transactions",
      // Only persist transaction history — NOT the payment flow state.
      // This ensures a page refresh always lands the user at idle,
      // never mid-payment, while keeping history intact.
      partialize: (state) => ({ transactions: state.transactions }),
    },
  ),
);

export const MAX_PAYMENT_RETRIES = MAX_RETRIES;
