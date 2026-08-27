export const CATEGORIES = [
  'Produce',
  'Bakery',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Pantry',
  'Frozen',
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Theme = 'dark' | 'light';
export type FulfillmentMode = 'pickup' | 'delivery';
export type PaymentMethod = 'card' | 'paypal';
export type SortOption = 'featured' | 'name' | 'price-low' | 'price-high';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  priceCents: number;
  unit: string;
  image: string;
  badge?: string;
  inStock: boolean;
  featuredOrder: number;
}

export interface PickupStore {
  id: string;
  name: string;
  area: string;
  hours: string;
}

export type CartQuantities = Record<string, number>;

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface OrderLine {
  productId: string;
  name: string;
  image: string;
  unit: string;
  unitPriceCents: number;
  quantity: number;
}

export interface OrderTotals {
  subtotalCents: number;
  fulfillmentFeeCents: number;
  taxCents: number;
  totalCents: number;
}

export interface OrderReceipt {
  id: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  fulfillment: FulfillmentMode;
  pickupStoreId: string | null;
  contact: string;
  pickupAt: string | null;
  lines: OrderLine[];
  totals: OrderTotals;
}

export interface PersistedStateV1 {
  version: 1;
  theme: Theme;
  fulfillment: FulfillmentMode;
  selectedStoreId: string;
  cart: CartQuantities;
  lastOrder: OrderReceipt | null;
}

