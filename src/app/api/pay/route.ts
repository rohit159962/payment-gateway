import { NextRequest, NextResponse } from "next/server";
import { PaymentPayload, PaymentResult } from "@/types";

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<PaymentResult>> {
  const payload: PaymentPayload = await req.json();
  const { transactionId } = payload;

  const rand = Math.random();

  // ~15% timeout: respond after 8 seconds (frontend will abort at 6s)
  if (rand < 0.15) {
    await sleep(8000);
    return NextResponse.json({
      success: false,
      transactionId,
      message: "Gateway timeout",
    });
  }

  // Simulate processing delay
  await sleep(1200 + Math.random() * 800);

  // ~60% success (of the remaining 85%)
  const adjustedRand = rand - 0.15;
  if (adjustedRand < 0.51) {
    // ~60% of total
    return NextResponse.json({
      success: true,
      transactionId,
      message: "Payment approved",
    },{ headers: { "X-Transaction-Id": transactionId } } );
  }

  // ~25% failure
  const reasons = [
    "Insufficient funds",
    "Card declined by issuer",
    "Invalid card details",
    "Bank server error",
    "Suspected fraud — contact your bank",
  ];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];

  return NextResponse.json({
    success: false,
    transactionId,
    message: reason,
  });
}