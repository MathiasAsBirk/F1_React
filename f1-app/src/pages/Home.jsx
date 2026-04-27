import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "../styles/Home.module.css";
import { API_URL, STORAGE_KEYS } from "../constants";

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
          axios.get(`${API_URL}/api/driverstandings`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/api/teamstandings`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/api/raceresults`).catch(() => ({ data: [] })),
        ]);
        if (!isMounted) return;
        setDrivers(Array.isArray(d.data) ? d.data : []);
        setTeams(Array.isArray(t.data) ? t.data : []);
        setResults(Array.isArray(r.data) ? r.data : []);
      } catch {
        setErr("Couldn't reach the API right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const topDrivers = useMemo(() => {
    const arr = [...drivers];
    arr.sort((a, b) =>
      typeof a.points === "number"
        ? (b.points ?? 0) - (a.points ?? 0)
        : (a.position ?? 999) - (b.position ?? 999)
    );
    return arr.slice(0, 5);
  }, [drivers]);

  const topTeams = useMemo(() => {
    const arr = [...teams];
    arr.sort((a, b) =>
      typeof a.points === "number"
        ? (b.points ?? 0) - (a.points ?? 0)
        : (a.position ?? 999) - (b.position ?? 999)
    );
    return arr.slice(0, 5);
  }, [teams]);

  const latestResult = useMemo(() => {
    if (!results.length) return null;
    const withDate = results.filter(r => r.date);
    if (withDate.length) {
      withDate.sort((a, b) => new Date(b.date) - new Date(a.date));
      return withDate[0];
    }
    return results[results.length - 1];
  }, [results]);

  const racesCount = results.length;

  const newsCount = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NEWS);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : null;
    } catch { return null; }
  }, []);

  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.seasonBadge}>2026 Season</span>
          <h1 className={styles.title}>Formula 1<br /><span className={styles.titleAccent}>Hub</span></h1>
          <p className={styles.tagline}>
            Standings, results, news, and a fully-playable manager sim — all in one place.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.ctaPrimary} href="/standings">View Standings</a>
            <a className={styles.ctaSecondary} href="/team">Play F1 Manager</a>
            <a className={styles.ctaGhost} href="/light">Lights Out</a>
          </div>
        </div>
        <div className={styles.heroAccent} aria-hidden="true" />
      </section>

      {/* STATS STRIP */}
      <div className={styles.strip}>
        <Stat label="Races Completed" value={racesCount || "—"} />
        <Stat label="Drivers" value={drivers.length || "—"} />
        <Stat label="Teams" value={teams.length || "—"} />
        <Stat label="News Articles" value={newsCount ?? "—"} />
      </div>

      {/* LATEST RACE — featured */}
      <section className={styles.featured}>
        <div className={styles.featuredInner}>
          <div className={styles.featuredLabel}>Latest Result</div>
          {loading ? (
            <div className={styles.skelBox} />
          ) : latestResult ? (
            <div className={styles.featuredContent}>
              <div className={styles.featuredLeft}>
                <div className={styles.featuredGP}>{latestResult.grandPrix}</div>
                <div className={styles.featuredDate}>
                  {latestResult.date
                    ? new Date(latestResult.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
                    : "—"}
                </div>
              </div>
              <div className={styles.featuredPodium}>
                {latestResult.winner && (
                  <PodiumRow pos="1st" driver={latestResult.winner} extra={latestResult.car} time={latestResult.time} />
                )}
                {latestResult.p2 && (
                  <PodiumRow pos="2nd" driver={latestResult.p2} time={latestResult.p2time} />
                )}
                {latestResult.p3 && (
                  <PodiumRow pos="3rd" driver={latestResult.p3} time={latestResult.p3time} />
                )}
              </div>
            </div>
          ) : (
            <div className={styles.empty}>No results yet.</div>
          )}
          <a className={styles.featuredLink} href="/races">Full race calendar →</a>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className={styles.quick}>
        <NavCard href="/drivers" title="Drivers & Teams"  sub="Full 2026 grid overview" />
        <NavCard href="/races"   title="Races"            sub="Calendar, winners & circuits" />
        <NavCard href="/news"    title="News"             sub="Latest stories & features" />
        <NavCard href="/team"    title="F1 Manager"       sub="Build your dream team" />
      </section>

      {/* LEADERBOARDS */}
      <section className={styles.leaders}>
        <LeaderBlock title="Drivers Championship" link="/standings" linkLabel="Full table">
          {loading ? <SkeletonRows rows={5} /> : topDrivers.map((d, i) => (
            <Row
              key={d.driver || i}
              pos={d.position ?? i + 1}
              name={d.driver || d.name}
              right={`${d.points ?? "—"} pts`}
              nat={d.nationality}
            />
          ))}
        </LeaderBlock>

        <LeaderBlock title="Constructors Championship" link="/standings?tab=teams" linkLabel="Full table">
          {loading ? <SkeletonRows rows={5} /> : topTeams.map((t, i) => (
            <Row
              key={t.team || i}
              pos={t.position ?? i + 1}
              name={t.team}
              right={`${t.points ?? "—"} pts`}
            />
          ))}
        </LeaderBlock>
      </section>

      {err && <p className={styles.error}>{err}</p>}
    </div>
  );
}

/* helpers */

function Stat({ label, value }) {
  return (
    <div className={styles.statItem}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function NavCard({ href, title, sub }) {
  return (
    <a className={styles.navCard} href={href}>
      <div>
        <div className={styles.navTitle}>{title}</div>
        <div className={styles.navSub}>{sub}</div>
      </div>
      <span className={styles.navArrow}>→</span>
    </a>
  );
}

function PodiumRow({ pos, driver, extra, time }) {
  const cls = pos === "1st" ? styles.pos1 : pos === "2nd" ? styles.pos2 : styles.pos3;
  return (
    <div className={styles.podiumRow}>
      <span className={`${styles.podPos} ${cls}`}>{pos}</span>
      <span className={styles.podDriver}>{driver}{extra ? <span className={styles.podExtra}> · {extra}</span> : null}</span>
      <span className={styles.podTime}>{time}</span>
    </div>
  );
}

function LeaderBlock({ title, link, linkLabel, children }) {
  return (
    <div className={styles.leaderCol}>
      <div className={styles.blockHeader}>
        <h3 className={styles.h3}>{title}</h3>
        <a className={styles.smallLink} href={link}>{linkLabel}</a>
      </div>
      <div className={styles.list}>{children}</div>
    </div>
  );
}

function Row({ pos, name, right, nat }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowPos}>{pos}</span>
      <span className={styles.rowName}>{name}{nat ? <span className={styles.rowNat}> {nat}</span> : null}</span>
      <span className={styles.rowRight}>{right}</span>
    </div>
  );
}

function Empty({ msg }) {
  return <div className={styles.empty}>{msg}</div>;
}

function SkeletonRows({ rows = 3 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <div key={i} className={styles.skelRow}>
      <div className={styles.skelDot} />
      <div className={styles.skelMid} />
      <div className={styles.skelTiny} />
    </div>
  ));
}
