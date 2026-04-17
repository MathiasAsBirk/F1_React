import { useState } from "react";
import AdminStandingsForm from "../components/admin/AdminStandingsForm";
import styles from "../styles/Admin.module.css";

export default function Admin() {
  const [input,    setInput]    = useState("");
  const [token,    setToken]    = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [err,      setErr]      = useState("");

  const handleLogin = () => {
    const validToken = import.meta.env.VITE_ADMIN_TOKEN || "secret123";
    if (input === validToken) {
      setToken(validToken);
      setIsAuthed(true);
      setErr("");
    } else {
      setErr("Wrong password — try again.");
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
          placeholder="Enter admin password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.loginBtn} onClick={handleLogin}>Login</button>
        {err && <p className={styles.error}>{err}</p>}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Race Standings Admin</h1>
      <p>Welcome, you are now logged in.</p>
      <AdminStandingsForm token={token} />
    </div>
  );
}
