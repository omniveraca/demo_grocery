import { ArrowRight, ShoppingBasket, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/money';
import { useStore } from '../state/StoreContext';
import { FulfillmentToggle } from './FulfillmentToggle';
import { OrderSummary } from './OrderSummary';
import { QuantityControl } from './QuantityControl';
import styles from '../styles/App.module.css';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { lines, itemCount, totals, setQuantity, state } = useStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled)',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  const checkout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className={styles.drawerLayer}>
      <button className={styles.drawerBackdrop} type="button" onClick={onClose} aria-label="Close cart" />
      <aside
        className={styles.drawer}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className={styles.drawerHeader}>
          <div>
            <p className={styles.eyebrow}>Cart</p>
            <h2 id="cart-title">Cart · {itemCount} {itemCount === 1 ? 'item' : 'items'}</h2>
          </div>
          <button ref={closeButtonRef} className={styles.iconButton} type="button" onClick={onClose} aria-label="Close cart">
            <X size={21} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className={styles.emptyCart}>
            <span><ShoppingBasket size={30} /></span>
            <h3>Your cart is empty</h3>
            <p>Add groceries from the catalog. They stay saved in this browser.</p>
            <button className={styles.primaryButton} type="button" onClick={onClose}>Browse groceries</button>
          </div>
        ) : (
          <>
            <div className={styles.drawerMode}>
              <span>How would you like your order?</span>
              <FulfillmentToggle />
              <p>
                {state.fulfillment === 'delivery'
                  ? '$6.99 demo delivery'
                  : 'Free pickup · choose your store at checkout'}
              </p>
            </div>
            <div className={styles.cartLines}>
              {lines.map(({ product, quantity }) => (
                <article className={styles.cartLine} key={product.id}>
                  <img src={product.image} alt="" />
                  <div className={styles.cartLineInfo}>
                    <h3>{product.name}</h3>
                    <p>{product.unit}</p>
                    <strong>{formatCurrency(product.priceCents * quantity)}</strong>
                  </div>
                  <QuantityControl
                    compact
                    quantity={quantity}
                    productName={product.name}
                    onChange={(next) => setQuantity(product.id, next)}
                  />
                </article>
              ))}
            </div>
            <div className={styles.drawerFooter}>
              <OrderSummary totals={totals} />
              <button className={styles.primaryButton} type="button" onClick={checkout}>
                Go to checkout <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
