import { Minus, Plus } from 'lucide-react';
import styles from '../styles/App.module.css';

interface QuantityControlProps {
  quantity: number;
  productName: string;
  onChange: (quantity: number) => void;
  compact?: boolean;
}

export function QuantityControl({
  quantity,
  productName,
  onChange,
  compact = false,
}: QuantityControlProps) {
  return (
    <div className={`${styles.quantityControl} ${compact ? styles.quantityCompact : ''}`}>
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity === 1 ? `Remove ${productName}` : `Decrease ${productName} quantity`}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <span aria-live="polite" aria-label={`${quantity} in cart`}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= 20}
        aria-label={`Increase ${productName} quantity`}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

