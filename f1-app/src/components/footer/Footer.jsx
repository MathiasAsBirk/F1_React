import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.foot}>
      <div className={styles.footLine} aria-hidden="true" />

      <div className={styles.footGrid}>
        <div className={styles.footCol}>
          <h4 className={styles.footTitle}>
            F1<span className={styles.footAccent}>Info</span>
          </h4>
          <p className={styles.footText}>
            Unofficial F1 hub for standings, results, explainers and a web-based manager sim.
            Built as a school project — purely for learning and fun.
          </p>
        </div>

        <div className={styles.footCol}>
          <h4>Quick Links</h4>
          <ul className={styles.footList}>
            <li><Link to="/drivers">Drivers</Link></li>
            <li><Link to="/races">Races</Link></li>
            <li><Link to="/standings">Standings</Link></li>
          </ul>
        </div>

        <div className={styles.footCol}>
          <h4>Follow</h4>
          <div className={styles.footSocial}>
            <a href="https://www.instagram.com/f1/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">
              <span aria-hidden="true">IG</span>
            </a>
            <a href="https://www.youtube.com/@F1" target="_blank" rel="noreferrer" aria-label="YouTube" title="YouTube">
              <span aria-hidden="true">YT</span>
            </a>
          </div>
        </div>

        <div className={styles.footCol}>
          <h4>Contact</h4>
          <ul className={styles.footList}>
            <li><a href="mailto:info@f1info.com">info@f1info.com</a></li>
            <li>School project · {year}</li>
          </ul>
        </div>
      </div>

      <div className={styles.footBottom}>
        © {year} F1Info — Not affiliated with Formula One Group. For educational use only.
      </div>
    </footer>
  );
}
