# Ready Pay — Payment Gateway

## Setup

```bash
npm install
npm run dev
# open https://payment-gateway-readypay.vercel.app/
```

## Architecture Decisions

**State Management: Zustand**  
Single-domain flow (one payment at a time). Zustand removes the actions/reducers/selectors ceremony. The `persist` middleware handles localStorage sync for transaction history with one line.

**AbortController timeout**  
Frontend cancels the request after 6 seconds. The API intentionally sleeps 8 seconds for the ~15% timeout case, so the client always wins the race.

**Idempotency**  
`crypto.randomUUID()` generates the transaction ID before the first attempt. Every retry sends the same ID. The store `upsertTransaction` merges by ID, so history has one entry per payment regardless of retry count.

**Separation of concerns**  
- `utils/` — pure functions (no React), fully unit-testable  
- `hooks/` — API calls and side effects  
- `store/` — global state  
- `components/` — presentational  
- No business logic inside JSX

## What I'd improve given more time

- Add Luhn algorithm validation for card numbers  
- Unit tests for all utils with Vitest  
- E2E tests with Playwright for the full payment flow  
- Real currency conversion rates via an FX API  
- Animate card flip to show CVV on the back  
- Add receipt download as PDF on success  
- Rate-limit the `/api/pay` route with an IP-based counter