import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/App.module.css';

export function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return (
    <section className={styles.privacyPage}>
      <p className={styles.eyebrow}>Legal</p>
      <h1>Privacy Policy</h1>

      <aside className={styles.privacyNotice} role="note">
        <span>Sample page</span>
        This is a generic privacy policy included with this website demo. Downtown Demo Market is owned by{' '}
        <a href="https://omnivera.pro" rel="noopener noreferrer">Omnivera</a>.
      </aside>

      <article className={styles.policy}>
        <section>
          <h2>1. Who we are</h2>
          <p>
            Downtown Demo Market ("we", "us") is a front-end grocery store demo. It does not take real orders
            or process real payments.
          </p>
          <p>
            This demo is owned by{' '}
            <a href="https://omnivera.pro" rel="noopener noreferrer">Omnivera</a>.
            All store locations are fictional.
          </p>
        </section>

        <section>
          <h2>2. We do not collect information</h2>
          <p>
            We do not collect personal information. Checkout fields, cart contents, and theme preference never
            leave this browser. No data is sent to Omnivera, a backend, or any other party.
          </p>
          <p>
            If you type a phone number, email, or pickup time, that text stays in this page until you leave or
            clear it. The site may also keep cart and theme details in this browser's local storage so the demo
            can remember them on a return visit. That storage is local to your device.
          </p>
        </section>

        <section>
          <h2>3. How the demo uses local data</h2>
          <p>Anything kept in this browser is used only to:</p>
          <ul>
            <li>Show your cart, checkout, and order confirmation on this page</li>
            <li>Remember pickup or delivery preference and the selected store</li>
            <li>Keep the light or dark theme you chose</li>
          </ul>
          <p>
            We do not sell, share, or transmit this information. There is nothing to sell or share because
            nothing is collected and nothing is sent anywhere.
          </p>
        </section>

        <section>
          <h2>4. Your choices</h2>
          <p>
            You can clear this site's stored data from your browser settings. You can also start a new cart from
            the{' '}
            <Link to="/">market</Link>
            {' '}and leave checkout fields blank. Clearing site data removes the local demo record from this
            browser.
          </p>
        </section>
      </article>
    </section>
  );
}
