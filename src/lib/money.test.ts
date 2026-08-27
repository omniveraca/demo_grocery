import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/catalog';
import { calculateTotals, formatCurrency } from './money';

describe('money utilities', () => {
  const apples = PRODUCTS.find((product) => product.id === 'honeycrisp-apples')!;
  const milk = PRODUCTS.find((product) => product.id === 'whole-milk')!;
  const lines = [
    { product: apples, quantity: 2 },
    { product: milk, quantity: 1 },
  ];

  it('calculates free pickup and rounds 13% HST in cents', () => {
    expect(calculateTotals(lines, 'pickup')).toEqual({
      subtotalCents: 1777,
      fulfillmentFeeCents: 0,
      taxCents: 231,
      totalCents: 2008,
    });
  });

  it('taxes the flat delivery fee with the merchandise', () => {
    expect(calculateTotals(lines, 'delivery')).toEqual({
      subtotalCents: 1777,
      fulfillmentFeeCents: 699,
      taxCents: 322,
      totalCents: 2798,
    });
  });

  it('formats cents as Canadian dollars', () => {
    expect(formatCurrency(1099)).toMatch(/\$10\.99/);
  });
});

