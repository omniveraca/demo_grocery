import { Moon, ShoppingBag, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { formatCurrency } from '../lib/money';
import { useStore } from '../state/StoreContext';
import { Brand } from './Brand';
import { SearchBox } from './SearchBox';
import styles from '../styles/App.module.css';

interface HeaderProps {
  query: string;
  debouncedQuery: string;
  onQueryChange: (query: string) => void;
  onSelectProduct: (productId: string) => void;
  onOpenCart: () => void;
}

export function Header({
  query,
  debouncedQuery,
  onQueryChange,
  onSelectProduct,
  onOpenCart,
}: HeaderProps) {
  const { state, setTheme, itemCount, totals } = useStore();
  const { pathname } = useLocation();
  const showSearch = pathname !== '/privacy';

  return (
    <header className={styles.header}>
      <div className={`${styles.headerInner} ${showSearch ? '' : styles.headerInnerWithoutSearch}`}>
        <Brand />
        {showSearch ? (
          <SearchBox
            query={query}
            debouncedQuery={debouncedQuery}
            onQueryChange={onQueryChange}
            onSelectProduct={onSelectProduct}
          />
        ) : null}
        <div className={styles.headerActions}>
          <button
            className={styles.iconButton}
            type="button"
            onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className={styles.cartButton}
            type="button"
            onClick={onOpenCart}
            aria-label={`Cart, ${formatCurrency(totals.subtotalCents)} subtotal, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            <span className={styles.cartLabel}>
              <small>Cart</small>
              <strong>{formatCurrency(totals.subtotalCents)}</strong>
            </span>
            <span className={styles.cartCount} aria-label={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}>
              {itemCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
