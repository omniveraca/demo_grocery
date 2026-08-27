import { useCallback, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SEARCH_DEBOUNCE_MS } from './lib/catalog';
import { useDebouncedValue } from './lib/useDebouncedValue';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import styles from './styles/App.module.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [focusedProductId, setFocusedProductId] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const isSearching = Boolean(query.trim()) && query.trim() !== debouncedQuery.trim();

  return (
    <div className={styles.appShell}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <Header
        query={query}
        debouncedQuery={debouncedQuery}
        onQueryChange={setQuery}
        onSelectProduct={setFocusedProductId}
        onOpenCart={() => setCartOpen(true)}
      />
      <main id="main-content" className={styles.main}>
        <Routes>
          <Route
            path="/"
            element={(
              <CatalogPage
                query={debouncedQuery}
                isSearching={isSearching}
                focusedProductId={focusedProductId}
                onFocusHandled={() => setFocusedProductId(null)}
                onClearSearch={() => setQuery('')}
              />
            )}
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route
            path="*"
            element={(
              <CatalogPage
                query={debouncedQuery}
                isSearching={isSearching}
                focusedProductId={focusedProductId}
                onFocusHandled={() => setFocusedProductId(null)}
                onClearSearch={() => setQuery('')}
              />
            )}
          />
        </Routes>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </div>
  );
}
