import type { CartLine, FulfillmentMode, OrderTotals } from '../types';

export const DELIVERY_FEE_CENTS = 699;
export const HST_RATE = 0.13;

const currency = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
});

export function formatCurrency(cents: number): string {
  return currency.format(cents / 100);
}

export function calculateTotals(
  lines: Pick<CartLine, 'product' | 'quantity'>[],
  fulfillment: FulfillmentMode,
): OrderTotals {
  const subtotalCents = lines.reduce(
    (total, line) => total + line.product.priceCents * line.quantity,
    0,
  );
  const fulfillmentFeeCents = fulfillment === 'delivery' ? DELIVERY_FEE_CENTS : 0;
  const taxableCents = subtotalCents + fulfillmentFeeCents;
  const taxCents = Math.round(taxableCents * HST_RATE);

  return {
    subtotalCents,
    fulfillmentFeeCents,
    taxCents,
    totalCents: taxableCents + taxCents,
  };
}

