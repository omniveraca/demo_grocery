import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary';
import { PICKUP_STORES } from '../data/stores';
import { formatCurrency } from '../lib/money';
import { useStore } from '../state/StoreContext';
import styles from '../styles/App.module.css';

export function ConfirmationPage() {
  const { state, clearReceipt } = useStore();
  const navigate = useNavigate();
  const receipt = state.lastOrder;

  if (!receipt) return <Navigate to="/" replace />;

  const pickupStore = PICKUP_STORES.find((store) => store.id === receipt.pickupStoreId);
  const continueShopping = () => {
    clearReceipt();
    navigate('/');
  };

  return (
    <section className={styles.confirmationPage}>
      <div className={styles.confirmationMark}><Check size={38} strokeWidth={2.5} /></div>
      <p className={styles.eyebrow}>Demo order confirmed</p>
      <h1>Order confirmed</h1>
      <p className={styles.confirmationLead}>
        Thanks for trying Downtown Demo Market. This is a demo, so no payment was taken and no real order was placed.
      </p>

      <div className={styles.receiptCard}>
        <div className={styles.receiptHeader}>
          <div><span>Order number</span><strong>{receipt.id}</strong></div>
          <div><span>Payment</span><strong>{receipt.paymentMethod === 'card' ? 'Card demo' : 'PayPal demo'}</strong></div>
          <div><span>Fulfillment</span><strong>{receipt.fulfillment === 'pickup' ? pickupStore?.name : 'Demo delivery'}</strong></div>
          {receipt.contact ? <div><span>How we can reach you</span><strong>{receipt.contact}</strong></div> : null}
          {receipt.pickupAt ? <div><span>When we can expect you</span><strong>{receipt.pickupAt}</strong></div> : null}
        </div>
        <div className={styles.receiptLines}>
          {receipt.lines.map((line) => (
            <article key={line.productId}>
              <img src={line.image} alt="" />
              <div><h2>{line.name}</h2><p>{line.quantity} × {line.unit} · {formatCurrency(line.unitPriceCents)} each</p></div>
              <strong>{formatCurrency(line.unitPriceCents * line.quantity)}</strong>
            </article>
          ))}
        </div>
        <OrderSummary totals={receipt.totals} />
      </div>

      <button className={styles.primaryButton} type="button" onClick={continueShopping}>
        <ShoppingBag size={18} /> Continue shopping <ArrowRight size={18} />
      </button>
    </section>
  );
}
