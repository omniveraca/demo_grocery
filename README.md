# Downtown Demo Market

Downtown Demo Market is a front-end grocery store demo built with React, TypeScript, and Vite. It includes product search, category filters, sorting, a persistent cart, pickup or delivery, a 13% HST calculation, two mock payment paths, and an order receipt.

Everything is local to the browser. There is no backend, account system, or real payment processing.

## Run locally

Requires Node.js 22.13 or newer.

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite, normally `http://localhost:5173/demo_grocery/`.

## Scripts

```bash
pnpm lint       # ESLint
pnpm typecheck  # TypeScript project check
pnpm test       # Vitest test suite
pnpm build      # TypeScript + production Vite build
pnpm preview    # Preview the production build
```

## Demo behaviour

- The first visit uses dark mode; the light/dark preference is persisted.
- Header search waits a short pause after typing, then lists matching groceries in a dropdown. Choosing a result jumps to that product in the catalog; **Add** puts it in the cart. Clearing the query restores the full catalog immediately.
- Cart quantities, fulfillment, selected pickup store, and the latest receipt use the versioned `downtown-demo-market:v1` local-storage record.
- Pickup is free. Delivery adds a flat `$6.99` demo fee.
- Checkout asks how we can reach you, and when we can expect you if the order is pickup.
- HST is 13% of the merchandise subtotal plus any delivery fee, rounded to the nearest cent.
- Card and PayPal are selectable demo payment methods. **Place order** creates a local confirmation. It does not process a real payment.
- A demo privacy policy at `/privacy` states that checkout details stay in this browser and are never sent anywhere. The demo is owned by [Omnivera](https://omnivera.pro).
- All store locations are fictional and all catalog imagery is generated specifically for this demo.

If browser storage is blocked or corrupt, the app falls back to safe defaults and continues in memory.

GitHub Pages publishes the production build from `main` to `https://omniveraca.github.io/demo_grocery/`. In the repo, set Pages source to GitHub Actions.
