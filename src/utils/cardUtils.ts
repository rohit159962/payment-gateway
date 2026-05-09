import { CardType } from "@/types";

export const CARD_PATTERNS: Record<Exclude<CardType, "unknown">, RegExp> = {
  visa: /^4/,
  mastercard: /^5[1-5]/,
  amex: /^3[47]/,
};

export function detectCardType(number: string): CardType {
  const raw = number.replace(/\s/g, "");
  for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(raw)) return type as CardType;
  }
  return "unknown";
}

export function formatCardNumber(value: string, cardType: CardType): string {
  const raw = value.replace(/\D/g, "");
  const maxLen = cardType === "amex" ? 15 : 16;
  const trimmed = raw.slice(0, maxLen);

  if (cardType === "amex") {
    // Format: 4-6-5
    return trimmed
      .replace(/^(\d{4})(\d{1,6})/, "$1 $2")
      .replace(/^(\d{4} \d{6})(\d{1,5})/, "$1 $2");
  }
  // Format: 4-4-4-4
  return trimmed.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value: string): string {
  const raw = value.replace(/\D/g, "").slice(0, 4);
  if (raw.length >= 3) return raw.slice(0, 2) + "/" + raw.slice(2);
  return raw;
}

export function cvvLength(cardType: CardType): number {
  return cardType === "amex" ? 4 : 3;
}