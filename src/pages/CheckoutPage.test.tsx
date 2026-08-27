import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../lib/storage';
import { StoreProvider } from '../state/StoreContext';
import { CheckoutPage } from './CheckoutPage';

function seedCart() {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      theme: 'dark',
      fulfillment: 'pickup',
      selectedStoreId: 'market-square',
      cart: { 'honeycrisp-apples': 1 },
      lastOrder: null,
    }),
  );
}

function renderCheckout() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <CheckoutPage />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    seedCart();
  });

  it('keeps Place order disabled until contact, pickup time, and payment are chosen', () => {
    renderCheckout();

    expect(screen.getByRole('heading', { name: 'How can we reach you' })).toBeInTheDocument();
    expect(screen.getByLabelText('When can we expect you')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Card/ })).toBeEnabled();

    fireEvent.change(screen.getByLabelText('Phone or email'), { target: { value: '555-0100' } });
    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('When can we expect you'), {
      target: { value: 'Today around 5:00 PM' },
    });
    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /Card/ }));
    expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled();
    expect(screen.getByRole('heading', { name: 'Review your order' })).toBeInTheDocument();
  });

  it('does not focus a field when its title is clicked', () => {
    renderCheckout();

    fireEvent.click(screen.getByText('When can we expect you'));
    expect(screen.getByLabelText('When can we expect you')).not.toHaveFocus();

    fireEvent.click(screen.getByText('Phone or email'));
    expect(screen.getByLabelText('Phone or email')).not.toHaveFocus();
  });

  it('hides the pickup time field for delivery', () => {
    renderCheckout();
    fireEvent.click(screen.getByRole('button', { name: 'Delivery' }));
    expect(screen.queryByLabelText('When can we expect you')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Phone or email'), { target: { value: 'demo@market.test' } });
    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /PayPal/ }));
    expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled();
  });
});
