import { Currency } from "@/types";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
};

export function formatCurrency(amount: string, currency: Currency): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? "";
  const num = parseFloat(amount || "0");
  return `${sym}${isNaN(num) ? "0.00" : num.toFixed(2)}`;
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
}