/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { PRODUCT_BY_ID } from '../data/catalog';
import { PICKUP_STORES } from '../data/stores';
import { calculateTotals } from '../lib/money';
import { createOrderReceipt } from '../lib/order';
import { loadPersistedState, savePersistedState } from '../lib/storage';
import type {
  CartLine,
  FulfillmentMode,
  OrderReceipt,
  PaymentMethod,
  PersistedStateV1,
  Theme,
} from '../types';

export type StoreAction =
  | { type: 'set-theme'; theme: Theme }
  | { type: 'set-fulfillment'; fulfillment: FulfillmentMode }
  | { type: 'set-store'; storeId: string }
  | { type: 'set-quantity'; productId: string; quantity: number }
  | { type: 'complete-order'; receipt: OrderReceipt }
  | { type: 'clear-receipt' };

export function storeReducer(state: PersistedStateV1, action: StoreAction): PersistedStateV1 {
  switch (action.type) {
    case 'set-theme':
      return { ...state, theme: action.theme };
    case 'set-fulfillment':
      return { ...state, fulfillment: action.fulfillment };
    case 'set-store':
      return { ...state, selectedStoreId: action.storeId };
    case 'set-quantity': {
      const cart = { ...state.cart };
      if (action.quantity <= 0) delete cart[action.productId];
      else cart[action.productId] = Math.min(20, Math.max(1, Math.round(action.quantity)));
      return { ...state, cart };
    }
    case 'complete-order':
      return { ...state, cart: {}, lastOrder: action.receipt };
    case 'clear-receipt':
      return { ...state, lastOrder: null };
  }
}

function hydrateState(): PersistedStateV1 {
  const state = loadPersistedState();
  const validCart = Object.fromEntries(
    Object.entries(state.cart).filter(([productId]) => PRODUCT_BY_ID.has(productId)),
  );
  const selectedStoreId = PICKUP_STORES.some((store) => store.id === state.selectedStoreId)
    ? state.selectedStoreId
    : PICKUP_STORES[0].id;
  return { ...state, cart: validCart, selectedStoreId };
}

interface StoreContextValue {
  state: PersistedStateV1;
  lines: CartLine[];
  itemCount: number;
  totals: ReturnType<typeof calculateTotals>;
  setTheme: (theme: Theme) => void;
  setFulfillment: (fulfillment: FulfillmentMode) => void;
  setStore: (storeId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  addItem: (productId: string) => void;
  completeOrder: (
    paymentMethod: PaymentMethod,
    details: { contact: string; pickupAt: string | null },
  ) => OrderReceipt;
  clearReceipt: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, undefined, hydrateState);

  const lines = useMemo(
    () =>
      Object.entries(state.cart).flatMap(([productId, quantity]) => {
        const product = PRODUCT_BY_ID.get(productId);
        return product ? [{ product, quantity }] : [];
      }),
    [state.cart],
  );
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const totals = useMemo(
    () => calculateTotals(lines, state.fulfillment),
    [lines, state.fulfillment],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      state.theme === 'dark' ? '#11130f' : '#f4f7ed',
    );
  }, [state.theme]);

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      lines,
      itemCount,
      totals,
      setTheme: (theme) => dispatch({ type: 'set-theme', theme }),
      setFulfillment: (fulfillment) => dispatch({ type: 'set-fulfillment', fulfillment }),
      setStore: (storeId) => dispatch({ type: 'set-store', storeId }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: 'set-quantity', productId, quantity }),
      addItem: (productId) =>
        dispatch({
          type: 'set-quantity',
          productId,
          quantity: (state.cart[productId] ?? 0) + 1,
        }),
      completeOrder: (paymentMethod, details) => {
        const receipt = createOrderReceipt({
          lines,
          totals,
          paymentMethod,
          fulfillment: state.fulfillment,
          selectedStoreId: state.selectedStoreId,
          contact: details.contact,
          pickupAt: details.pickupAt,
        });
        dispatch({ type: 'complete-order', receipt });
        return receipt;
      },
      clearReceipt: () => dispatch({ type: 'clear-receipt' }),
    }),
    [itemCount, lines, state, totals],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
