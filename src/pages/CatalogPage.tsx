import { ArrowRight, Clock3, RotateCcw, ShoppingBasket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, type Category, type SortOption } from '../types';
import { PRODUCT_BY_ID, PRODUCTS } from '../data/catalog';
import { filterAndSortProducts } from '../lib/catalog';
import { ProductCard } from '../components/ProductCard';
import { SortDropdown } from '../components/SortDropdown';
import styles from '../styles/App.module.css';

interface CatalogPageProps {
  query: string;
  isSearching?: boolean;
  focusedProductId?: string | null;
  onFocusHandled?: () => void;
  onClearSearch: () => void;
}

export function CatalogPage({
  query,
  isSearching = false,
  focusedProductId = null,
  onFocusHandled,
  onClearSearch,
}: CatalogPageProps) {
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [sort, setSort] = useState<SortOption>('featured');
  const products = useMemo(
    () => filterAndSortProducts(PRODUCTS, query, category, sort),
    [category, query, sort],
  );

  useEffect(() => {
    if (query.trim()) setCategory('All');
  }, [query]);

  useEffect(() => {
    if (!focusedProductId) return;
    if (category !== 'All') {
      setCategory('All');
      return;
    }

    const node = document.getElementById(`product-${focusedProductId}`);
    if (!node) {
      onFocusHandled?.();
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const timeout = window.setTimeout(() => onFocusHandled?.(), 1600);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [category, focusedProductId, onFocusHandled, products]);

  const resetFilters = () => {
    setCategory('All');
    setSort('featured');
    onClearSearch();
  };

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}><ShoppingBasket size={16} /> Grocery demo</p>
          <h1 id="hero-title">Shop groceries<br /><span>for pickup or delivery.</span></h1>
          <p>Browse the catalog, add items to your cart, and check out. No real payment is taken.</p>
          <a className={styles.heroLink} href="#catalog">
            See products <ArrowRight size={18} />
          </a>
        </div>
        <div className={styles.heroProducts} aria-hidden="true">
          <div className={styles.heroProductMain}>
            <img src={PRODUCT_BY_ID.get('honeycrisp-apples')?.image} alt="" />
          </div>
          <div className={styles.heroProductSmall}>
            <img src={PRODUCT_BY_ID.get('country-sourdough')?.image} alt="" />
          </div>
        </div>
        <aside className={styles.heroPromise}>
          <Clock3 size={22} />
          <div>
            <strong>Pickup or delivery</strong>
            <span>Pickup is free. Demo delivery is $6.99.</span>
          </div>
        </aside>
        <span className={styles.heroBorder} aria-hidden="true" />
      </section>

      <section className={styles.marketStrip} aria-label="Pricing and pickup">
        <span><strong>100%</strong> Canadian pricing</span>
        <span><strong>13%</strong> HST shown upfront</span>
        <span><strong>Free</strong> store pickup</span>
      </section>

      <section
        className={`${styles.catalogSection} ${isSearching ? styles.catalogBusy : ''}`}
        id="catalog"
        aria-labelledby="catalog-title"
        aria-busy={isSearching}
      >
        <div className={styles.catalogHeading}>
          <div>
            <p className={styles.eyebrow}>Catalog</p>
            <h2 id="catalog-title">Products</h2>
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <div className={styles.categoryRow} aria-label="Filter by category">
          {(['All', ...CATEGORIES] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? styles.categoryActive : ''}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className={styles.resultMeta} aria-live="polite">
          <span>
            {isSearching
              ? 'Searching...'
              : `${products.length} ${products.length === 1 ? 'item' : 'items'}`}
          </span>
          {(query || category !== 'All') && !isSearching && (
            <span>
              {query ? `Matching “${query}”` : category}
            </span>
          )}
        </div>

        {products.length ? (
          <div
            className={`${styles.productGrid} ${isSearching ? styles.productGridDim : ''}`}
            key={`${query}:${category}:${sort}`}
          >
            {products.map((product, index) => (
              <ProductCard
                product={product}
                key={product.id}
                highlight={product.id === focusedProductId}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <span><RotateCcw size={26} /></span>
            <h3>No groceries found</h3>
            <p>Try a different search or reset the filters.</p>
            <button className={styles.secondaryButton} type="button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
