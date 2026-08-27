import { Bike, Store } from 'lucide-react';
import { useStore } from '../state/StoreContext';
import styles from '../styles/App.module.css';

export function FulfillmentToggle() {
  const { state, setFulfillment } = useStore();

  return (
    <div
      className={styles.fulfillmentToggle}
      role="group"
      aria-label="Choose fulfillment method"
    >
      <button
        className={state.fulfillment === 'pickup' ? styles.segmentActive : ''}
        type="button"
        onClick={() => setFulfillment('pickup')}
        aria-pressed={state.fulfillment === 'pickup'}
      >
        <Store size={17} aria-hidden="true" />
        Pickup
      </button>
      <button
        className={state.fulfillment === 'delivery' ? styles.segmentActive : ''}
        type="button"
        onClick={() => setFulfillment('delivery')}
        aria-pressed={state.fulfillment === 'delivery'}
      >
        <Bike size={17} aria-hidden="true" />
        Delivery
      </button>
    </div>
  );
}
