import { describe, expect, it } from 'vitest';
import { DEFAULT_PERSISTED_STATE } from '../lib/storage';
import type { OrderReceipt } from '../types';
import { storeReducer } from './StoreContext';

const receipt: OrderReceipt = {
  id: 'GW-123456',
  createdAt: '2026-08-26T12:00:00.000Z',
  paymentMethod: 'card',
  fulfillment: 'pickup',
  pickupStoreId: 'market-square',
  contact: '555-0100',
  pickupAt: 'Today around 5:00 PM',
  lines: [],
  totals: { subtotalCents: 0, fulfillmentFeeCents: 0, taxCents: 0, totalCents: 0 },
};

describe('storeReducer', () => {
  it('adds, caps, and removes cart quantities', () => {
    let state = storeReducer(DEFAULT_PERSISTED_STATE, {
      type: 'set-quantity',
      productId: 'honeycrisp-apples',
      quantity: 2,
    });
    state = storeReducer(state, { type: 'set-quantity', productId: 'honeycrisp-apples', quantity: 99 });
    expect(state.cart['honeycrisp-apples']).toBe(20);
    state = storeReducer(state, { type: 'set-quantity', productId: 'honeycrisp-apples', quantity: 0 });
    expect(state.cart).toEqual({});
  });

  it('stores the receipt and clears the cart after payment', () => {
    const withCart = { ...DEFAULT_PERSISTED_STATE, cart: { 'ripe-bananas': 3 } };
    const completed = storeReducer(withCart, { type: 'complete-order', receipt });
    expect(completed.cart).toEqual({});
    expect(completed.lastOrder).toEqual(receipt);
  });
});
