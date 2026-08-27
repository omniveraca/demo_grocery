import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PERSISTED_STATE, loadPersistedState, parsePersistedState, savePersistedState } from './storage';

describe('persistence', () => {
  it('hydrates valid values and removes invalid cart quantities', () => {
    const state = parsePersistedState({
      version: 1,
      theme: 'light',
      fulfillment: 'delivery',
      selectedStoreId: 'lakeside',
      cart: { apples: 2, bananas: 21, milk: -1, eggs: 1.2 },
      lastOrder: null,
    });
    expect(state.theme).toBe('light');
    expect(state.fulfillment).toBe('delivery');
    expect(state.cart).toEqual({ apples: 2 });
  });

  it('recovers from corrupt JSON or blocked reads', () => {
    const corruptStorage = { getItem: () => '{broken' };
    const blockedStorage = { getItem: vi.fn(() => { throw new DOMException('Blocked'); }) };
    expect(loadPersistedState(corruptStorage)).toEqual(DEFAULT_PERSISTED_STATE);
    expect(loadPersistedState(blockedStorage)).toEqual(DEFAULT_PERSISTED_STATE);
  });

  it('reports blocked writes without throwing', () => {
    const blockedStorage = { setItem: vi.fn(() => { throw new DOMException('Blocked'); }) };
    expect(savePersistedState(DEFAULT_PERSISTED_STATE, blockedStorage)).toBe(false);
  });

  it('keeps valid receipts and fills missing contact fields', () => {
    const state = parsePersistedState({
      version: 1,
      theme: 'dark',
      fulfillment: 'pickup',
      selectedStoreId: 'market-square',
      cart: {},
      lastOrder: {
        id: 'GW-123456',
        createdAt: '2026-08-26T12:00:00.000Z',
        paymentMethod: 'card',
        fulfillment: 'pickup',
        pickupStoreId: 'market-square',
        lines: [{
          productId: 'apples',
          name: 'Apples',
          image: '/apples.webp',
          unit: 'bag',
          unitPriceCents: 399,
          quantity: 1,
        }],
        totals: { subtotalCents: 399, fulfillmentFeeCents: 0, taxCents: 52, totalCents: 451 },
      },
    });
    expect(state.lastOrder?.contact).toBe('');
    expect(state.lastOrder?.pickupAt).toBeNull();
  });
});

