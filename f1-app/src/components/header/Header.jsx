import styles from "./Header.module.css";
import carImage from '../../assets/f1-cars.jpg';


export default function Header() {
  return (
    <>
    
    <div className={styles.container}>
    <div style={{
    background: `url(${carImage}) center/cover no-repeat`
  }}>
    
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <p className={styles.heroSubtitle}>
            Next race · 29 August 2025 · Zandvoort
          </p>
          <h1 className={styles.heroTitle}>Netherlands Grand Prix</h1>
          <a href="/races" className={styles.btn}>Event Details</a>
        </div>
      </section>
    <div className={styles.divider}></div>
    </div>
   </div> 
    </>
  );
}
