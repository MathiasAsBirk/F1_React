import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "../styles/Standings.module.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Standings() {
  const [tab, setTab] = useState("drivers");
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(""); setLoading(true);
        const [d, t, r] = await Promise.all([
          axios.get(`${API}/api/driverstandings`).catch(() => ({ data: [] })),
          axios.get(`${API}/api/teamstandings`).catch(() => ({ data: [] })),
          axios.get(`${API}/api/raceresults`).catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        setDrivers(Array.isArray(d.data) ? d.data : []);
        setTeams(Array.isArray(t.data) ? t.data : []);
        setResults(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        setErr("Couldn’t reach the API.");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // dynamic position by points (desc) with tie‑safe fallback
  const sortedDrivers = useMemo(() => {
    const arr = [...drivers];
    arr.sort(
      (a, b) =>
        (b.points ?? 0) - (a.points ?? 0) ||
        (a.position ?? 999) - (b.position ?? 999)
    );
    return arr.map((d, i) => ({ ...d, _pos: i + 1 }));
  }, [drivers]);

  const sortedTeams = useMemo(() => {
    const arr = [...teams];
    arr.sort(
      (a, b) =>
        (b.points ?? 0) - (a.points ?? 0) ||
        (a.position ?? 999) - (b.position ?? 999)
    );
    return arr.map((t, i) => ({ ...t, _pos: i + 1 }));
  }, [teams]);

  const driversCols = ["Pos", "Driver", "Nationality", "Car", "Points"];
  const teamsCols   = ["Pos", "Team", "Points"];
  const resultsCols = ["Grand Prix", "Date", "Winner", "Car", "Laps", "Time"];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>2025 Standings & Results</h1>
        <div className={styles.sub}>For best view use Desktop</div>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab==="drivers" ? styles.active : ""}`} onClick={() => setTab("drivers")}>Drivers</button>
          <button className={`${styles.tab} ${tab==="teams"   ? styles.active : ""}`} onClick={() => setTab("teams")}>Teams</button>
          <button className={`${styles.tab} ${tab==="results" ? styles.active : ""}`} onClick={() => setTab("results")}>Race Winners</button>
        </div>
      </header>

      {err && <p className={styles.error}>{err}</p>}

      {tab === "drivers" && (
        <Table
          loading={loading}
          headers={driversCols}
          rows={sortedDrivers.map(d => [d._pos, d.driver, d.nationality, d.car, d.points])}
          styles={styles}
        />
      )}

      {tab === "teams" && (
        <Table
          loading={loading}
          headers={teamsCols}
          rows={sortedTeams.map(t => [t._pos, t.team, t.points])}
          styles={styles}
        />
      )}

      {tab === "results" && (
        <Table
          loading={loading}
          headers={resultsCols}
          rows={results.map((r) => [
            r.grandPrix,
            r.date ? new Date(r.date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—",
            r.winner, r.car, r.laps, r.time
          ])}
          styles={styles}
        />
      )}
    </div>
  );
}

/* tiny table component with skeletons */
function Table({ loading, headers, rows, styles }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className={styles.skelRow}>
                  {headers.map((_, j) => <td key={j}><div className={styles.skel} /></td>)}
                </tr>
              ))
            : rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => <td key={j}>{c ?? "—"}</td>)}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}
