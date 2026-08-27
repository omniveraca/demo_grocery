import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { SortOption } from '../types';
import { SortDropdown } from './SortDropdown';

function Harness() {
  const [value, setValue] = useState<SortOption>('featured');
  return <SortDropdown value={value} onChange={setValue} />;
}

describe('SortDropdown', () => {
  it('opens a custom listbox and selects an option', () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: /sort by featured/i });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Sort by' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'Price: high to low' }));
    expect(screen.getByRole('button', { name: /sort by price: high to low/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports keyboard opening and Escape-to-close', () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: /sort by featured/i });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const selected = screen.getByRole('option', { name: 'Featured' });
    expect(selected).toHaveFocus();

    fireEvent.keyDown(selected, { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
