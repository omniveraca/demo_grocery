import type {
  CartQuantities,
  FulfillmentMode,
  OrderReceipt,
  PaymentMethod,
  PersistedStateV1,
  Theme,
} from '../types';

export const STORAGE_KEY = 'downtown-demo-market:v1';

export const DEFAULT_PERSISTED_STATE: PersistedStateV1 = {
  version: 1,
  theme: 'dark',
  fulfillment: 'pickup',
  selectedStoreId: 'market-square',
  cart: {},
  lastOrder: null,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTheme = (value: unknown): value is Theme => value === 'dark' || value === 'light';
const isFulfillment = (value: unknown): value is FulfillmentMode =>
  value === 'pickup' || value === 'delivery';
const isPayment = (value: unknown): value is PaymentMethod =>
  value === 'card' || value === 'paypal';

function parseCart(value: unknown): CartQuantities {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, quantity]) =>
        key.length > 0 && Number.isInteger(quantity) && Number(quantity) >= 1 && Number(quantity) <= 20,
    ),
  ) as CartQuantities;
}

function parseReceipt(value: unknown): OrderReceipt | null {
  if (value === null) return null;
  if (!isRecord(value) || !Array.isArray(value.lines) || !isRecord(value.totals)) return null;
  if (
    typeof value.id !== 'string' ||
    typeof value.createdAt !== 'string' ||
    !isPayment(value.paymentMethod) ||
    !isFulfillment(value.fulfillment) ||
    !(value.pickupStoreId === null || typeof value.pickupStoreId === 'string')
  ) {
    return null;
  }

  const contact = typeof value.contact === 'string' ? value.contact : '';
  const pickupAt =
    value.pickupAt === null || typeof value.pickupAt === 'string' ? value.pickupAt : null;

  const validLines = value.lines.every(
    (line) =>
      isRecord(line) &&
      typeof line.productId === 'string' &&
      typeof line.name === 'string' &&
      typeof line.image === 'string' &&
      typeof line.unit === 'string' &&
      Number.isInteger(line.unitPriceCents) &&
      Number(line.unitPriceCents) >= 0 &&
      Number.isInteger(line.quantity) &&
      Number(line.quantity) >= 1,
  );
  const totals = value.totals;
  const validTotals = ['subtotalCents', 'fulfillmentFeeCents', 'taxCents', 'totalCents'].every(
    (key) => Number.isInteger(totals[key]) && Number(totals[key]) >= 0,
  );

  return validLines && validTotals
    ? ({ ...value, contact, pickupAt } as unknown as OrderReceipt)
    : null;
}

export function parsePersistedState(value: unknown): PersistedStateV1 {
  if (!isRecord(value) || value.version !== 1) return { ...DEFAULT_PERSISTED_STATE };

  return {
    version: 1,
    theme: isTheme(value.theme) ? value.theme : 'dark',
    fulfillment: isFulfillment(value.fulfillment) ? value.fulfillment : 'pickup',
    selectedStoreId:
      typeof value.selectedStoreId === 'string' ? value.selectedStoreId : 'market-square',
    cart: parseCart(value.cart),
    lastOrder: parseReceipt(value.lastOrder),
  };
}

export function loadPersistedState(storage: Pick<Storage, 'getItem'> = window.localStorage): PersistedStateV1 {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? parsePersistedState(JSON.parse(raw)) : { ...DEFAULT_PERSISTED_STATE };
  } catch {
    return { ...DEFAULT_PERSISTED_STATE };
  }
}

export function savePersistedState(
  state: PersistedStateV1,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
