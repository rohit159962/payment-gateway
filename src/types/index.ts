export type PaymentStatus = "idle" | "processing" | "success" | "failed" | "timeout";

export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type Currency = "INR" | "USD";

export interface PaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  last4: string;
  expiry: string;
  amount: string;
  currency: Currency;
  attempt: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface Transaction {
  id: string;
  amount: string;
  currency: Currency;
  status: "success" | "failed" | "timeout";
  message: string;
  attempts: number;
  timestamp: number;
  last4?: string;
}

export interface PaymentState {
  status: PaymentStatus;
  message: string;
  transactionId: string | null;
  attempt: number;
  transactions: Transaction[];
}