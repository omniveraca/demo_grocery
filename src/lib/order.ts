import type {
  CartLine,
  FulfillmentMode,
  OrderReceipt,
  OrderTotals,
  PaymentMethod,
} from '../types';

interface CreateOrderInput {
  lines: CartLine[];
  totals: OrderTotals;
  fulfillment: FulfillmentMode;
  selectedStoreId: string;
  paymentMethod: PaymentMethod;
  contact: string;
  pickupAt: string | null;
  id?: string;
  createdAt?: string;
}

function makeOrderId(): string {
  return `GW-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function createOrderReceipt({
  lines,
  totals,
  fulfillment,
  selectedStoreId,
  paymentMethod,
  contact,
  pickupAt,
  id = makeOrderId(),
  createdAt = new Date().toISOString(),
}: CreateOrderInput): OrderReceipt {
  return {
    id,
    createdAt,
    paymentMethod,
    fulfillment,
    pickupStoreId: fulfillment === 'pickup' ? selectedStoreId : null,
    contact: contact.trim(),
    pickupAt: fulfillment === 'pickup' ? pickupAt?.trim() || null : null,
    lines: lines.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      image: product.image,
      unit: product.unit,
      unitPriceCents: product.priceCents,
      quantity,
    })),
    totals,
  };
}

