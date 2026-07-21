import { Link } from "react-router-dom";
import styles from "../styles/NotFound.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <span>404 · Off track</span>
      <h1>That page does not exist.</h1>
      <p>The route may have moved, or the link may be incorrect.</p>
      <Link to="/">Return to the F1Info home page</Link>
    </main>
  );
}
