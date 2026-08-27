import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { SortOption } from '../types';
import styles from '../styles/App.module.css';

const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const labelId = useId();
  const listboxId = useId();
  const selectedIndex = Math.max(0, SORT_OPTIONS.findIndex((option) => option.value === value));
  const selectedLabel = SORT_OPTIONS[selectedIndex].label;

  useEffect(() => {
    if (!open) return;
    optionRefs.current[selectedIndex]?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, selectedIndex]);

  const closeAndFocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const selectOption = (option: SortOption) => {
    onChange(option);
    closeAndFocusTrigger();
  };

  const moveFocus = (index: number) => {
    const next = (index + SORT_OPTIONS.length) % SORT_OPTIONS.length;
    optionRefs.current[next]?.focus();
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onOptionKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveFocus(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveFocus(SORT_OPTIONS.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocusTrigger();
    }
  };

  return (
    <div className={styles.sortControl} ref={rootRef}>
      <span id={labelId}>Sort by</span>
      <div className={styles.sortDropdown}>
        <button
          ref={triggerRef}
          className={styles.sortTrigger}
          type="button"
          aria-labelledby={`${labelId} ${listboxId}-value`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={onTriggerKeyDown}
        >
          <span id={`${listboxId}-value`}>{selectedLabel}</span>
          <ChevronDown size={17} aria-hidden="true" />
        </button>
        {open && (
          <ul className={styles.sortMenu} id={listboxId} role="listbox" aria-labelledby={labelId}>
            {SORT_OPTIONS.map((option, index) => (
              <li key={option.value} role="presentation">
                <button
                  ref={(element) => { optionRefs.current[index] = element; }}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => selectOption(option.value)}
                  onKeyDown={(event) => onOptionKeyDown(event, index)}
                >
                  <span>{option.label}</span>
                  <Check size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
