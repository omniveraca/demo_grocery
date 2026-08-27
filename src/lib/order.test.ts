import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/catalog';
import { calculateTotals } from './money';
import { createOrderReceipt } from './order';

describe('createOrderReceipt', () => {
  it('creates a stable pickup receipt without retaining mutable product objects', () => {
    const lines = [{ product: PRODUCTS[0], quantity: 2 }];
    const totals = calculateTotals(lines, 'pickup');
    const receipt = createOrderReceipt({
      lines,
      totals,
      fulfillment: 'pickup',
      selectedStoreId: 'market-square',
      paymentMethod: 'card',
      contact: '  555-0100  ',
      pickupAt: '  Today around 5:00 PM  ',
      id: 'GW-123456',
      createdAt: '2026-08-26T12:00:00.000Z',
    });

    expect(receipt.id).toBe('GW-123456');
    expect(receipt.pickupStoreId).toBe('market-square');
    expect(receipt.contact).toBe('555-0100');
    expect(receipt.pickupAt).toBe('Today around 5:00 PM');
    expect(receipt.lines[0]).toMatchObject({ productId: 'honeycrisp-apples', quantity: 2 });
  });

  it('omits the pickup store for delivery receipts', () => {
    const lines = [{ product: PRODUCTS[1], quantity: 1 }];
    const receipt = createOrderReceipt({
      lines,
      totals: calculateTotals(lines, 'delivery'),
      fulfillment: 'delivery',
      selectedStoreId: 'market-square',
      paymentMethod: 'paypal',
      contact: 'demo@market.test',
      pickupAt: 'Today around 5:00 PM',
    });
    expect(receipt.pickupStoreId).toBeNull();
    expect(receipt.contact).toBe('demo@market.test');
    expect(receipt.pickupAt).toBeNull();
  });
});

