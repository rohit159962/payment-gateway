"use client";

import { useRef, useCallback } from "react";
import { usePaymentStore, MAX_PAYMENT_RETRIES } from "@/store/paymentStore";
import { PaymentFormValues, PaymentPayload } from "@/types";

const TIMEOUT_MS = 6000;

export function usePayment(form: PaymentFormValues) {
  const store = usePaymentStore();
  const abortRef = useRef<AbortController | null>(null);

  const processPayment = useCallback(
    async (transactionId: string, attempt: number) => {
      store.startProcessing(transactionId);

      // Cancel any previous in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Frontend 6-second timeout
      const timeoutHandle = setTimeout(
        () => controller.abort(),
        TIMEOUT_MS
      );

      const payload: PaymentPayload = {
        transactionId,
        cardholderName: form.cardholderName,
        last4: form.cardNumber.replace(/\s/g, "").slice(-4),
        expiry: form.expiry,
        amount: form.amount,
        currency: form.currency,
        attempt,
      };

      try {
        const res = await fetch("/api/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutHandle);

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const result = await res.json();

        if (result.success) {
          store.setSuccess(transactionId, result.message);
          store.upsertTransaction({
            id: transactionId,
            amount: form.amount,
            currency: form.currency,
            status: "success",
            message: result.message,
            attempts: attempt,
            timestamp: Date.now(),
            last4: payload.last4,
          });
        } else {
          store.setFailed(transactionId, result.message);
          store.upsertTransaction({
            id: transactionId,
            amount: form.amount,
            currency: form.currency,
            status: "failed",
            message: result.message,
            attempts: attempt,
            timestamp: Date.now(),
            last4: payload.last4,
          });
        }
      } catch (err: unknown) {
        clearTimeout(timeoutHandle);

        const isAbort =
          err instanceof Error &&
          (err.name === "AbortError" || err.message === "AbortError");

        if (isAbort) {
          store.setTimeout(transactionId);
          store.upsertTransaction({
            id: transactionId,
            amount: form.amount,
            currency: form.currency,
            status: "timeout",
            message: "Request timed out",
            attempts: attempt,
            timestamp: Date.now(),
            last4: payload.last4,
          });
        } else {
          const msg =
            err instanceof Error ? err.message : "Network error. Please try again.";
          store.setFailed(transactionId, msg);
          store.upsertTransaction({
            id: transactionId,
            amount: form.amount,
            currency: form.currency,
            status: "failed",
            message: msg,
            attempts: attempt,
            timestamp: Date.now(),
            last4: payload.last4,
          });
        }
      }
    },
    [form, store]
  );

  function initiatePayment() {
    const txId = crypto.randomUUID();
    store.incrementAttempt();
    processPayment(txId, 1);
    return txId;
  }

  function retryPayment(txId: string, currentAttempt: number) {
    if (currentAttempt >= MAX_PAYMENT_RETRIES) return;
    store.incrementAttempt();
    processPayment(txId, currentAttempt + 1);
  }

  return { initiatePayment, retryPayment };
}