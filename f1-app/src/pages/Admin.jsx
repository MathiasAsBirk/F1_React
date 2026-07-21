import { useState } from "react";
import AdminStandingsForm from "../components/admin/AdminStandingsForm";
import styles from "../styles/Admin.module.css";
import { api, apiErrorMessage } from "../api/client";

export default function Admin() {
  const [input,    setInput]    = useState("");
  const [token,    setToken]    = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [err,      setErr]      = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!input || loading) return;
    setLoading(true);
    try {
      const response = await api.post("/admin/session", { password: input });
      if (response.data?.token) {
        setToken(response.data.token);
        setInput("");
        setIsAuthed(true);
        setErr("");
      }
    } catch (error) {
      setErr(apiErrorMessage(error, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  if (!isAuthed) {
    return (
      <div className={styles.page}>
        <h1>Admin Login</h1>
        <input
          className={styles.loginInput}
          type="password"
          aria-label="Admin password"
          autoComplete="current-password"
          placeholder="Enter admin password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.loginBtn} disabled={loading || !input} onClick={handleLogin}>{loading ? "Signing in…" : "Login"}</button>
        {err && <p className={styles.error} role="alert">{err}</p>}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Race Standings Admin</h1>
      <p>Your admin session expires automatically.</p>
      <button className={styles.loginBtn} onClick={() => { setToken(""); setIsAuthed(false); }}>Log out</button>
      <AdminStandingsForm token={token} onUnauthorized={() => { setToken(""); setIsAuthed(false); }} />
    </div>
  );
}
