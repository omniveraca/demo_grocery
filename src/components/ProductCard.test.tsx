import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/catalog';
import { StoreProvider } from '../state/StoreContext';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  beforeEach(() => window.localStorage.clear());

  it('replaces the add action with an accessible quantity control', () => {
    const product = PRODUCTS[0];
    render(
      <StoreProvider>
        <ProductCard product={product} />
      </StoreProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByLabelText('1 in cart')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `Increase ${product.name} quantity` }));
    expect(screen.getByLabelText('2 in cart')).toBeInTheDocument();
  });

  it('disables add for an out-of-stock product', () => {
    const product = PRODUCTS.find((item) => !item.inStock)!;
    render(
      <StoreProvider>
        <ProductCard product={product} />
      </StoreProvider>,
    );
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  });
});
