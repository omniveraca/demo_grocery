import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_DEBOUNCE_MS } from '../lib/catalog';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { StoreProvider } from '../state/StoreContext';
import { SearchBox } from './SearchBox';

function Harness({
  onSelectProduct = () => {},
}: {
  onSelectProduct?: (productId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  return (
    <MemoryRouter>
      <StoreProvider>
        <SearchBox
          query={query}
          debouncedQuery={debouncedQuery}
          onQueryChange={setQuery}
          onSelectProduct={onSelectProduct}
        />
      </StoreProvider>
    </MemoryRouter>
  );
}

describe('SearchBox', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits to list matches until typing has paused', async () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Find Essentials' }), {
      target: { value: 'apple' },
    });

    expect(screen.getByText('Searching...')).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    });
    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByRole('option', { name: /honeycrisp apples/i })).toBeInTheDocument();
    expect(screen.getByText('1 match')).toBeInTheDocument();
  });

  it('lets a shopper add a match from the live results', async () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Find Essentials' }), {
      target: { value: 'milk' },
    });
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByLabelText('1 in cart')).toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', async () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Find Essentials' }), {
      target: { value: 'xylophone' },
    });
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(screen.getByText(/nothing in the demo catalog/i)).toBeInTheDocument();
  });

  it('selects the active match with Enter', async () => {
    const onSelectProduct = vi.fn();
    render(<Harness onSelectProduct={onSelectProduct} />);
    const input = screen.getByRole('combobox', { name: 'Find Essentials' });

    fireEvent.change(input, { target: { value: 'apple' } });
    await act(async () => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelectProduct).toHaveBeenCalledWith('country-sourdough');
  });
});
