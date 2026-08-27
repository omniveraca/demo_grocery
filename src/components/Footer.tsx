import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../styles/App.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <span><Leaf size={18} /></span>
        <strong>Downtown Demo Market</strong>
      </div>
      <p>A front-end grocery demo owned by <a href="https://omnivera.pro" rel="noopener noreferrer">Omnivera</a>. No real orders are placed.</p>
      <p>
        <Link to="/privacy">Privacy Policy</Link>
        <span aria-hidden="true"> · </span>
        © 2026 Downtown Demo Market
      </p>
    </footer>
  );
}
