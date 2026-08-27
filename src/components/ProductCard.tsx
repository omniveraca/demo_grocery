import { Plus } from 'lucide-react';
import type { CSSProperties } from 'react';
import { formatCurrency } from '../lib/money';
import { useStore } from '../state/StoreContext';
import type { Product } from '../types';
import { QuantityControl } from './QuantityControl';
import styles from '../styles/App.module.css';

export function ProductCard({
  product,
  highlight = false,
  index = 0,
}: {
  product: Product;
  highlight?: boolean;
  index?: number;
}) {
  const { state, addItem, setQuantity } = useStore();
  const quantity = state.cart[product.id] ?? 0;

  return (
    <article
      id={`product-${product.id}`}
      className={`${styles.productCard} ${!product.inStock ? styles.productUnavailable : ''} ${highlight ? styles.productHighlight : ''}`}
      style={{ '--i': index } as CSSProperties}
    >
      <div className={styles.productImageWrap}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
        {!product.inStock && <span className={styles.stockBadge}>Out of stock</span>}
      </div>
      <div className={styles.productBody}>
        <div>
          <p className={styles.productCategory}>{product.category}</p>
          <h3>{product.name}</h3>
          <p className={styles.productDescription}>{product.description}</p>
        </div>
        <div className={styles.productFooter}>
          <div className={styles.productPrice}>
            <strong>{formatCurrency(product.priceCents)}</strong>
            <span>{product.unit}</span>
          </div>
          {quantity > 0 ? (
            <QuantityControl
              quantity={quantity}
              productName={product.name}
              onChange={(next) => setQuantity(product.id, next)}
            />
          ) : (
            <button
              className={styles.addButton}
              type="button"
              onClick={() => addItem(product.id)}
              disabled={!product.inStock}
            >
              <Plus size={18} aria-hidden="true" />
              {product.inStock ? 'Add' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

