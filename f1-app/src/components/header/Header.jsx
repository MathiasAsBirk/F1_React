import styles from "./Header.module.css";

export default function Header() {
  return (
    <div className={styles.container}>
      <div className={styles.heroBg}>
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <p className={styles.heroSubtitle}>Next race · Coming soon</p>
            <h1 className={styles.heroTitle}>Formula 1 — 2025</h1>
            <a href="/races" className={styles.btn}>Event Details</a>
          </div>
        </section>
        <div className={styles.divider} />
      </div>
    </div>
  );
}
