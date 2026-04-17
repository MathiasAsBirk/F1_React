import { Component } from "react";

/**
 * Catches runtime errors anywhere in the child tree and shows a
 * friendly fallback instead of a blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || "Unknown error" };
  }

  componentDidCatch(err, info) {
    console.error("[ErrorBoundary]", err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "60vh", color: "#fff",
          fontFamily: "system-ui, sans-serif", gap: 16, padding: "2rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem" }}>🏁</div>
          <h2 style={{ color: "#e10600", margin: 0 }}>Something went wrong</h2>
          <p style={{ color: "#aaa", maxWidth: 480, margin: 0 }}>
            {this.state.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{
              marginTop: 8, padding: "10px 24px", background: "#e10600",
              color: "#fff", border: "none", borderRadius: 8,
              fontWeight: 700, cursor: "pointer", fontSize: "1rem",
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
