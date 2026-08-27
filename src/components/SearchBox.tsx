import { Plus, Search } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/catalog';
import { highlightSegments, searchProducts } from '../lib/catalog';
import { formatCurrency } from '../lib/money';
import { useStore } from '../state/StoreContext';
import type { Product } from '../types';
import { QuantityControl } from './QuantityControl';
import styles from '../styles/App.module.css';

interface SearchBoxProps {
  query: string;
  debouncedQuery: string;
  onQueryChange: (query: string) => void;
  onSelectProduct: (productId: string) => void;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightSegments(text, query).map((segment, index) => (
        segment.match ? <mark key={`${segment.value}-${index}`}>{segment.value}</mark> : segment.value
      ))}
    </>
  );
}

export function SearchBox({
  query,
  debouncedQuery,
  onQueryChange,
  onSelectProduct,
}: SearchBoxProps) {
  const { state, addItem, setQuantity } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const trimmedQuery = query.trim();
  const pending = Boolean(trimmedQuery) && trimmedQuery !== debouncedQuery.trim();
  const results = useMemo(
    () => (pending ? [] : searchProducts(PRODUCTS, debouncedQuery)),
    [debouncedQuery, pending],
  );
  const panelOpen = open && Boolean(trimmedQuery);
  const activeProduct = results[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, pending]);

  useEffect(() => {
    if (!panelOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [panelOpen]);

  const goHome = () => {
    if (location.pathname !== '/') navigate('/');
  };

  const updateQuery = (value: string) => {
    onQueryChange(value);
    setOpen(Boolean(value.trim()));
    goHome();
  };

  const selectProduct = (product: Product) => {
    setOpen(false);
    goHome();
    onSelectProduct(product.id);
  };

  const showCatalogResults = () => {
    setOpen(false);
    goHome();
    window.requestAnimationFrame(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (panelOpen) setOpen(false);
      else updateQuery('');
      return;
    }

    if (!trimmedQuery) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      if (!pending && results.length) {
        setActiveIndex((current) => (current + 1) % results.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (!pending && results.length) {
        setActiveIndex((current) => (current - 1 + results.length) % results.length);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!pending && activeProduct) selectProduct(activeProduct);
      else showCatalogResults();
    }
  };

  const statusLabel = pending
    ? 'Searching...'
    : results.length
      ? `${results.length} ${results.length === 1 ? 'match' : 'matches'}`
      : `No groceries matching “${debouncedQuery.trim()}”`;

  return (
    <div className={styles.search} ref={rootRef}>
      <div
        className={`${styles.searchBox} ${pending ? styles.searchBoxPending : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search size={19} aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onFocus={() => {
            if (trimmedQuery) setOpen(true);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="Find Essentials"
          autoComplete="off"
          aria-label="Find Essentials"
          aria-autocomplete="list"
          aria-expanded={panelOpen}
          aria-controls={panelOpen && !pending && results.length ? listboxId : undefined}
          aria-activedescendant={panelOpen && activeProduct ? `${listboxId}-${activeProduct.id}` : undefined}
        />
        {query ? (
          <button type="button" onClick={() => updateQuery('')} aria-label="Clear search">
            Clear
          </button>
        ) : null}
      </div>

      {panelOpen ? (
        <div className={styles.searchPanel}>
          <div className={styles.searchStatus} role="status" aria-live="polite">
            {pending ? <span className={styles.searchPulse} aria-hidden="true" /> : null}
            <span>{statusLabel}</span>
          </div>

          {pending ? (
            <div className={styles.searchSkeleton} aria-hidden="true">
              {Array.from({ length: 3 }, (_, index) => (
                <div className={styles.searchSkeletonRow} key={index} />
              ))}
            </div>
          ) : results.length ? (
            <>
              <ul className={styles.searchHits} id={listboxId} role="listbox" aria-label="Grocery matches">
                {results.map((product, index) => {
                  const quantity = state.cart[product.id] ?? 0;
                  return (
                    <li key={product.id} role="presentation">
                      <div
                        className={`${styles.searchHit} ${index === activeIndex ? styles.searchHitActive : ''}`}
                        style={{ '--i': index } as CSSProperties}
                      >
                        <button
                          id={`${listboxId}-${product.id}`}
                          className={styles.searchHitMain}
                          type="button"
                          role="option"
                          aria-selected={index === activeIndex}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectProduct(product)}
                        >
                          <img src={product.image} alt="" />
                          <span className={styles.searchHitCopy}>
                            <strong>
                              <HighlightedText text={product.name} query={debouncedQuery} />
                            </strong>
                            <small>
                              {product.category}
                              <span aria-hidden="true"> · </span>
                              {product.unit}
                            </small>
                          </span>
                          <span className={styles.searchHitPrice}>
                            {formatCurrency(product.priceCents)}
                            {!product.inStock ? <em>Out of stock</em> : null}
                          </span>
                        </button>
                        <div className={styles.searchHitAction}>
                          {quantity > 0 ? (
                            <QuantityControl
                              compact
                              quantity={quantity}
                              productName={product.name}
                              onChange={(next) => setQuantity(product.id, next)}
                            />
                          ) : (
                            <button
                              className={styles.searchAdd}
                              type="button"
                              onClick={() => addItem(product.id)}
                              disabled={!product.inStock}
                            >
                              <Plus size={16} aria-hidden="true" />
                              {product.inStock ? 'Add' : 'Unavailable'}
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button className={styles.searchSeeAll} type="button" onClick={showCatalogResults}>
                See {results.length} {results.length === 1 ? 'result' : 'results'} in the catalog
              </button>
            </>
          ) : (
            <div className={styles.searchEmpty}>
              <p>Nothing in the demo catalog matches that search.</p>
              <button className={styles.secondaryButton} type="button" onClick={() => updateQuery('')}>
                Clear search
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
