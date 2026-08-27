import { formatCurrency } from '../lib/money';
import type { OrderTotals } from '../types';
import styles from '../styles/App.module.css';

export function OrderSummary({ totals }: { totals: OrderTotals }) {
  return (
    <dl className={styles.orderTotals}>
      <div>
        <dt>Subtotal</dt>
        <dd>{formatCurrency(totals.subtotalCents)}</dd>
      </div>
      <div>
        <dt>Fulfillment fee</dt>
        <dd>{totals.fulfillmentFeeCents ? formatCurrency(totals.fulfillmentFeeCents) : 'Free'}</dd>
      </div>
      <div>
        <dt>HST (13%)</dt>
        <dd>{formatCurrency(totals.taxCents)}</dd>
      </div>
      <div className={styles.totalRow}>
        <dt>Total</dt>
        <dd>{formatCurrency(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}

