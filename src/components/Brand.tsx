import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../styles/App.module.css';

export function Brand() {
  return (
    <Link className={styles.brand} to="/" aria-label="Downtown Demo Market home">
      <span className={styles.brandMark} aria-hidden="true">
        <Leaf size={20} strokeWidth={2.5} />
      </span>
      <span className={styles.brandText}>
        <strong>DOWNTOWN</strong>
        <small>DEMO MARKET</small>
      </span>
    </Link>
  );
}
