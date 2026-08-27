import { ArrowLeft, Check, CreditCard, LockKeyhole, ShieldCheck, WalletCards } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FulfillmentToggle } from '../components/FulfillmentToggle';
import { OrderSummary } from '../components/OrderSummary';
import { PICKUP_STORES } from '../data/stores';
import { formatCurrency } from '../lib/money';
import { useStore } from '../state/StoreContext';
import type { PaymentMethod } from '../types';
import styles from '../styles/App.module.css';

export function CheckoutPage() {
  const { state, lines, totals, setStore, completeOrder } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [contact, setContact] = useState('');
  const [pickupAt, setPickupAt] = useState('');
  const contactId = useId();
  const pickupAtId = useId();
  const navigate = useNavigate();
  const contactReady = contact.trim().length > 0;
  const pickupReady = state.fulfillment === 'delivery' || pickupAt.trim().length > 0;
  const readyToPlace = Boolean(paymentMethod) && contactReady && pickupReady && !processing;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (!lines.length) {
    return (
      <section className={styles.routeState}>
        <span><CreditCard size={30} /></span>
        <p className={styles.eyebrow}>Checkout</p>
        <h1>Your cart is empty</h1>
        <p>Add items before you check out.</p>
        <Link className={styles.primaryButton} to="/">Back to products</Link>
      </section>
    );
  }

  const placeOrder = () => {
    if (!readyToPlace || !paymentMethod) return;
    setProcessing(true);
    window.setTimeout(() => {
      completeOrder(paymentMethod, {
        contact,
        pickupAt: state.fulfillment === 'pickup' ? pickupAt : null,
      });
      navigate('/confirmation');
    }, 650);
  };

  const placeOrderHint = !contactReady
    ? 'Add a phone number or email so we can reach you.'
    : !pickupReady
      ? 'Tell us when we can expect you for pickup.'
      : !paymentMethod
        ? 'Choose a payment method to place your order.'
        : null;

  return (
    <section className={styles.checkoutPage}>
      <Link className={styles.backLink} to="/"><ArrowLeft size={17} /> Back to shopping</Link>
      <div className={styles.checkoutTitle}>
        <div>
          <p className={styles.eyebrow}>Checkout</p>
          <h1>Review your order</h1>
        </div>
        <span><LockKeyhole size={17} /> Demo checkout</span>
      </div>

      <div className={styles.checkoutGrid}>
        <div className={styles.checkoutMain}>
          <section className={styles.checkoutPanel} aria-labelledby="fulfillment-title">
            <div className={styles.panelTitle}>
              <span>1</span>
              <div><p>Fulfillment</p><h2 id="fulfillment-title">How will you get your groceries?</h2></div>
            </div>
            <FulfillmentToggle />

            {state.fulfillment === 'pickup' ? (
              <>
                <fieldset className={styles.storeChoices}>
                  <legend>Choose a pickup store</legend>
                  {PICKUP_STORES.map((store) => (
                    <label key={store.id} className={state.selectedStoreId === store.id ? styles.storeSelected : ''}>
                      <input
                        type="radio"
                        name="pickup-store"
                        checked={state.selectedStoreId === store.id}
                        onChange={() => setStore(store.id)}
                      />
                      <span className={styles.radioMark}><Check size={14} /></span>
                      <span><strong>{store.name}</strong><small>{store.area}<br />{store.hours}</small></span>
                    </label>
                  ))}
                </fieldset>
                <div className={styles.checkoutField}>
                  <span id={pickupAtId}>When can we expect you</span>
                  <input
                    type="text"
                    name="pickup-at"
                    autoComplete="off"
                    aria-labelledby={pickupAtId}
                    value={pickupAt}
                    onChange={(event) => setPickupAt(event.target.value)}
                    placeholder="Today around 5:00 PM"
                  />
                  <small>A time that works with the store hours above.</small>
                </div>
              </>
            ) : (
              <div className={styles.deliveryNotice}>
                <ShieldCheck size={23} />
                <div>
                  <strong>Demo delivery · $6.99</strong>
                  <p>We’ll use your contact details if we need to follow up on this order.</p>
                </div>
              </div>
            )}
          </section>

          <section className={styles.checkoutPanel} aria-labelledby="contact-title">
            <div className={styles.panelTitle}>
              <span>2</span>
              <div><p>Contact</p><h2 id="contact-title">How can we reach you</h2></div>
            </div>
            <div className={styles.checkoutField}>
              <span id={contactId}>Phone or email</span>
              <input
                type="text"
                name="contact"
                autoComplete="email"
                aria-labelledby={contactId}
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Phone number or email"
              />
              <small>We’ll use this if anything comes up with your order.</small>
            </div>
          </section>

          <section className={styles.checkoutPanel} aria-labelledby="payment-title">
            <div className={styles.panelTitle}>
              <span>3</span>
              <div><p>Payment</p><h2 id="payment-title">Choose a demo payment</h2></div>
            </div>
            <p className={styles.paymentIntro}>Select a method to continue. This demo only creates a confirmation. No real payment is processed.</p>
            <fieldset className={styles.paymentButtons}>
              <legend className="srOnly">Payment method</legend>
              <label className={paymentMethod === 'card' ? styles.paymentSelected : undefined}>
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === 'card'}
                  disabled={processing}
                  onChange={() => setPaymentMethod('card')}
                />
                <CreditCard size={20} />
                <span>Card<small>Demo checkout</small></span>
              </label>
              <label className={paymentMethod === 'paypal' ? styles.paymentSelected : undefined}>
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === 'paypal'}
                  disabled={processing}
                  onChange={() => setPaymentMethod('paypal')}
                />
                <WalletCards size={20} />
                <span>PayPal<small>Demo checkout</small></span>
              </label>
            </fieldset>
          </section>
        </div>

        <aside className={styles.checkoutSummary} aria-labelledby="summary-title">
          <h2 id="summary-title">Order summary</h2>
          <div className={styles.checkoutLines}>
            {lines.map(({ product, quantity }) => (
              <div key={product.id}>
                <img src={product.image} alt="" />
                <span><strong>{product.name}</strong><small>{quantity} × {formatCurrency(product.priceCents)}</small></span>
                <b>{formatCurrency(product.priceCents * quantity)}</b>
              </div>
            ))}
          </div>
          <OrderSummary totals={totals} />
          <button
            className={`${styles.primaryButton} ${styles.placeOrderButton}`}
            type="button"
            disabled={!readyToPlace}
            onClick={placeOrder}
          >
            {processing ? 'Placing order…' : 'Place order'}
          </button>
          {!readyToPlace && !processing && placeOrderHint && (
            <p className={styles.placeOrderHint}>{placeOrderHint}</p>
          )}
          <p className={styles.summaryNote}><ShieldCheck size={16} /> 13% HST and all fees are included above.</p>
        </aside>
      </div>
    </section>
  );
}
