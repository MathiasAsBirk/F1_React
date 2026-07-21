import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className={styles.page} role="alert">
          <span>Unexpected pit stop</span>
          <h1>This page could not be displayed.</h1>
          <p>Reload the page to try again. If the problem continues, return to the home page.</p>
          <div>
            <button onClick={() => window.location.reload()}>Reload page</button>
            <a href="/">Return home</a>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
