"use client";
import { useState, useRef } from "react";
import { CardPreview } from "./CardPreview";
import { InputField } from "./ui/InputField";
import { SmartInput } from "./ui/SmartInput";
import { CurrencySelector } from "./ui/CurrencySelector";
import { Spinner } from "./ui/Spinner";
import { usePaymentStore, MAX_PAYMENT_RETRIES } from "@/store/paymentStore";
import { usePayment } from "@/hooks/usePayment";
import { detectCardType, formatCardNumber, formatExpiry, cvvLength } from "@/utils/cardUtils";
import { getFormErrors, isFormValid } from "@/utils/validation";
import { formatCurrency } from "@/utils/format";
import { PaymentFormValues, Currency } from "@/types";

const EMPTY_FORM: PaymentFormValues = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
  currency: "INR",
};

export function CardInput() {
  const [form, setForm] = useState<PaymentFormValues>(EMPTY_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof PaymentFormValues, boolean>>>({});
  const [cardType, setCardType] = useState<ReturnType<typeof detectCardType>>("unknown");
  const [submitting, setSubmitting] = useState(false);

  const { status, transactionId, attempt } = usePaymentStore();
  const { initiatePayment, retryPayment } = usePayment(form);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const errors = getFormErrors(form, cardType);
  const valid = isFormValid(errors);
  const cvvLen = cvvLength(cardType);

  function change(field: keyof PaymentFormValues, raw: string) {
    let val = raw;
    if (field === "cardNumber") {
      const ct = detectCardType(raw);
      setCardType(ct);
      val = formatCardNumber(raw, ct);
    }
    if (field === "expiry") val = formatExpiry(raw);
    if (field === "cvv") val = raw.replace(/\D/g, "").slice(0, cvvLen);
    if (field === "amount") val = raw.replace(/[^\d.]/g, "");
    if (field === "currency") val = raw;
    setForm((f) => ({ ...f, [field]: val }));
  }

  function blur(field: keyof PaymentFormValues) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function touchAll() {
    const all = Object.keys(EMPTY_FORM).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof PaymentFormValues, boolean>
    );
    setTouched(all);
  }

  async function handleSubmit() {
    touchAll();
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      initiatePayment();
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    if (!transactionId || attempt >= MAX_PAYMENT_RETRIES) return;
    retryPayment(transactionId, attempt);
  }

  const isProcessing = status === "processing";

  return (
    <div className="space-y-5">
      <CardPreview form={form} cardType={cardType} />

      {/* Card Number */}
      <InputField label="Card Number" id="cardNumber" error={touched.cardNumber ? errors.cardNumber : ""}>
        <div className="relative">
          <SmartInput
            id="cardNumber"
            value={form.cardNumber}
            onChange={(e) => change("cardNumber", e.target.value)}
            onBlurCapture={() => blur("cardNumber")}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            error={touched.cardNumber ? errors.cardNumber : ""}
            className="pr-16"
          />
          {cardType !== "unknown" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-violet-300">
              {cardType.toUpperCase()}
            </span>
          )}
        </div>
      </InputField>

      {/* Cardholder Name */}
      <InputField label="Cardholder Name" id="cardholderName" error={touched.cardholderName ? errors.cardholderName : ""}>
        <SmartInput
          id="cardholderName"
          value={form.cardholderName}
          onChange={(e) => change("cardholderName", e.target.value)}
          onBlurCapture={() => blur("cardholderName")}
          placeholder="John Doe"
          error={touched.cardholderName ? errors.cardholderName : ""}
        />
      </InputField>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Expiry" id="expiry" error={touched.expiry ? errors.expiry : ""}>
          <SmartInput
            id="expiry"
            value={form.expiry}
            onChange={(e) => change("expiry", e.target.value)}
            onBlurCapture={() => blur("expiry")}
            placeholder="MM/YY"
            inputMode="numeric"
            maxLength={5}
            error={touched.expiry ? errors.expiry : ""}
          />
        </InputField>

        <InputField label={`CVV (${cvvLen} digits)`} id="cvv" error={touched.cvv ? errors.cvv : ""}>
          <SmartInput
            id="cvv"
            value={form.cvv}
            onChange={(e) => change("cvv", e.target.value)}
            onBlurCapture={() => blur("cvv")}
            placeholder={cardType === "amex" ? "1234" : "123"}
            inputMode="numeric"
            maxLength={cvvLen}
            error={touched.cvv ? errors.cvv : ""}
          />
        </InputField>
      </div>

      {/* Amount */}
      <InputField label="Amount" id="amount" error={touched.amount ? errors.amount : ""}>
        <div className="flex gap-2">
          <CurrencySelector
            value={form.currency}
            onChange={(c) => change("currency", c)}
          />
          <SmartInput
            id="amount"
            value={form.amount}
            onChange={(e) => change("amount", e.target.value)}
            onBlurCapture={() => blur("amount")}
            placeholder="0.00"
            inputMode="decimal"
            error={touched.amount ? errors.amount : ""}
            className="flex-1"
          />
        </div>
      </InputField>

      {/* Submit */}
      <button
        ref={submitBtnRef}
        onClick={handleSubmit}
        disabled={!valid || isProcessing}
        aria-disabled={!valid || isProcessing}
        className={[
          "w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2",
          valid && !isProcessing
            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40 hover:opacity-90 cursor-pointer"
            : "bg-white/6 text-slate-500 cursor-not-allowed",
        ].join(" ")}
      >
        {isProcessing ? (
          <>
            <Spinner />
            <span>Processing…</span>
          </>
        ) : valid ? (
          `Pay ${form.amount ? formatCurrency(form.amount, form.currency) : "Now"}`
        ) : (
          "Complete all fields to continue"
        )}
      </button>

      <p className="text-center text-xs text-slate-600">🔒 256-bit SSL encrypted</p>
    </div>
  );
}