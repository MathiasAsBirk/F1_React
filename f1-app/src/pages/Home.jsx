import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "../styles/Home.module.css";


const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [results, setResults] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setErr("");
        const [d, t, r] = await Promise.all([
          axios.get(`${API}/api/driverstandings`).catch(() => ({ data: [] })),
          axios.get(`${API}/api/teamstandings`).catch(() => ({ data: [] })),
          axios.get(`${API}/api/raceresults`).catch(() => ({ data: [] })),
        ]);
        if (!isMounted) return;

        setDrivers(Array.isArray(d.data) ? d.data : []);
        setTeams(Array.isArray(t.data) ? t.data : []);
        setResults(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        setErr("Couldn’t reach the API right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const topDrivers = useMemo(() => {
    const arr = [...drivers];
    // Prefer points (desc). Fallback to position (asc).
    if (arr.length && typeof arr[0]?.points === "number") {
      arr.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    } else if (arr.length && typeof arr[0]?.position === "number") {
      arr.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    }
    return arr.slice(0, 3);
  }, [drivers]);

  const topTeams = useMemo(() => {
    const arr = [...teams];
    if (arr.length && typeof arr[0]?.points === "number") {
      arr.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    } else if (arr.length && typeof arr[0]?.position === "number") {
      arr.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    }
    return arr.slice(0, 3);
  }, [teams]);

  const latestResult = useMemo(() => {
    if (!Array.isArray(results) || results.length === 0) return null;
    // Try to sort by date descending if date exists
    const withDate = results.filter(r => r.date);
    if (withDate.length) {
      withDate.sort((a, b) => new Date(b.date) - new Date(a.date));
      return withDate[0];
    }
    // Fallback: take last item as "latest"
    return results[results.length - 1];
  }, [results]);

  const racesCount = Array.isArray(results) ? results.length : 0;

  // Optional: read your editable News from localStorage if you used that pattern
  const newsCount = useMemo(() => {
    try {
      const raw = localStorage.getItem("f1_news_v1");
      if (!raw) return null;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : null;
    } catch {
      return null;
    }
  }, []);

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>
            Formula 1 — 2025 Hub
          </h1>
          <p className={styles.tagline}>
            Standings, results, news, and a fully-playable manager sim — all in one place.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.ctaPrimary} href="/standings">View Standings</a>
            <a className={styles.ctaSecondary} href="/team">Play F1 Manager</a>
            <a className={styles.ctaGhost} href="/light">Lights Out (Reaction)</a>
          </div>
        </div>
      </section>

      {/* STRIP STATS */}
      <section className={styles.strip}>
        <div className={styles.stripItem}>
          <div className={styles.k}>Races</div>
          <div className={styles.v}>{racesCount || "—"}</div>
        </div>
        <div className={styles.stripItem}>
          <div className={styles.k}>Drivers</div>
          <div className={styles.v}>{drivers?.length || "—"}</div>
        </div>
        <div className={styles.stripItem}>
          <div className={styles.k}>Teams</div>
          <div className={styles.v}>{teams?.length || "—"}</div>
        </div>
        <div className={styles.stripItem}>
          <div className={styles.k}>News</div>
          <div className={styles.v}>{newsCount ?? "—"}</div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className={styles.quick}>
        <a className={styles.card} href="/drivers">
          <div className={styles.cardTitle}>Drivers & Teams</div>
          <div className={styles.cardSub}>Full 2025 grid overview</div>
        </a>
        <a className={styles.card} href="/races">
          <div className={styles.cardTitle}>Races</div>
          <div className={styles.cardSub}>Calendar, winners & info</div>
        </a>
        <a className={styles.card} href="/news">
          <div className={styles.cardTitle}>News</div>
          <div className={styles.cardSub}>Latest stories & features</div>
        </a>
        <a className={styles.card} href="/manager">
          <div className={styles.cardTitle}>F1 Manager</div>
          <div className={styles.cardSub}>Build your dream team</div>
        </a>
      </section>

      {/* LEADERBOARDS + LATEST RESULT */}
      <section className={styles.leaders}>
        <div className={styles.leaderCol}>
          <div className={styles.blockHeader}>
            <h3 className={styles.h3}>Top Drivers</h3>
            <a className={styles.smallLink} href="/standings">Full table</a>
          </div>
          <div className={styles.list}>
            {loading ? (
              <SkeletonRows rows={3} />
            ) : topDrivers.length ? (
              topDrivers.map((d, i) => (
                <Row
                  key={d.driver || d.name || i}
                  left={`#${(d.position ?? i + 1).toString().padStart(2, "0")}`}
                  mid={d.driver || d.name}
                  right={`${d.points ?? "—"} pts`}
                />
              ))
            ) : (
              <Empty msg="No driver data yet." />
            )}
          </div>
        </div>

        <div className={styles.leaderCol}>
          <div className={styles.blockHeader}>
            <h3 className={styles.h3}>Constructors</h3>
            <a className={styles.smallLink} href="/standings?tab=teams">Full table</a>
          </div>
          <div className={styles.list}>
            {loading ? (
              <SkeletonRows rows={3} />
            ) : topTeams.length ? (
              topTeams.map((t, i) => (
                <Row
                  key={t.team || i}
                  left={`#${(t.position ?? i + 1).toString().padStart(2, "0")}`}
                  mid={t.team}
                  right={`${t.points ?? "—"} pts`}
                />
              ))
            ) : (
              <Empty msg="No team data yet." />
            )}
          </div>
        </div>

        <div className={styles.resultCol}>
          <div className={styles.blockHeader}>
            <h3 className={styles.h3}>Latest Grand Prix</h3>
            <a className={styles.smallLink} href="/races">See all</a>
          </div>
          <div className={styles.resultCard}>
            {loading ? (
              <div className={styles.skelBox} />
            ) : latestResult ? (
              <>
                <div className={styles.resultTitle}>{latestResult.grandPrix || "Grand Prix"}</div>
                <div className={styles.resultMeta}>
                  {latestResult.date
                    ? new Date(latestResult.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </div>
                <div className={styles.resultWinner}>
                  Winner: <strong>{latestResult.winner || "—"}</strong>
                </div>
                <div className={styles.resultCar}>{latestResult.car || ""}</div>
                {latestResult.time && (
                  <div className={styles.resultExtra}>Time: {latestResult.time}</div>
                )}
              </>
            ) : (
              <Empty msg="No results yet." />
            )}
          </div>
        </div>
      </section>

      {/* FOOTER NOTE / ERROR */}
      {err && <p className={styles.error}>{err}</p>}
    </div>
  );
}

/* ---------- tiny helpers ---------- */

function Row({ left, mid, right }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>{left}</div>
      <div className={styles.rowMid}>{mid}</div>
      <div className={styles.rowRight}>{right}</div>
    </div>
  );
}

function Empty({ msg }) {
  return <div className={styles.empty}>{msg}</div>;
}

function SkeletonRows({ rows = 3 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skelRow}>
          <div className={styles.skelDot} />
          <div className={styles.skelMid} />
          <div className={styles.skelTiny} />
        </div>
      ))}
    </>
  );
}
