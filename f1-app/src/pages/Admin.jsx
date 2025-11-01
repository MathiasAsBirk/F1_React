import { useState } from "react";
import AdminStandingsForm from "../components/admin/AdminStandingsForm";

export default function Admin() {
  const [input, setInput] = useState("");
  const [token, setToken] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);

  const handleLogin = () => {
    const validToken = import.meta.env.VITE_ADMIN_TOKEN || "secret123";
    if (input === validToken) {
      setToken(validToken);
      setIsAuthed(true);
    } else {
      alert("Wrong password");
    }
  };

  if (!isAuthed) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Race Standings Admin</h1>
      <p>Welcome, you are now logged in.</p>
      <AdminStandingsForm token={token} />
    </div>
  );
}
