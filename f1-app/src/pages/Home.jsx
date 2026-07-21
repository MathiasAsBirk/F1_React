import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";
import { CURRENT_SEASON, DEFAULT_GUIDE_COUNT, STORAGE_KEYS } from "../constants";
import { api } from "../api/client";

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
          api.get("/standings/drivers"),
          api.get("/standings/teams"),
          api.get("/race-results"),
        ]);
        if (!isMounted) return;
        setDrivers(Array.isArray(d.data) ? d.data : []);
        setTeams(Array.isArray(t.data) ? t.data : []);
        setResults(Array.isArray(r.data) ? r.data : []);
      } catch {
        if (!isMounted) return;
        setDrivers([]);
        setTeams([]);
        setResults([]);
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
      if (!raw) return DEFAULT_GUIDE_COUNT;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : DEFAULT_GUIDE_COUNT;
    } catch { return DEFAULT_GUIDE_COUNT; }
  }, []);

  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.seasonBadge}>{CURRENT_SEASON} Season</span>
          <h1 className={styles.title}>Formula 1<br /><span className={styles.titleAccent}>Hub</span></h1>
          <p className={styles.tagline}>
            Standings, results, news, and a fully-playable manager sim — all in one place.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.ctaPrimary} to="/standings">View Standings</Link>
            <Link className={styles.ctaSecondary} to="/team">Play F1 Manager</Link>
            <Link className={styles.ctaGhost} to="/light">Lights Out</Link>
          </div>
        </div>
        <div className={styles.heroAccent} aria-hidden="true" />
      </section>

      {/* STATS STRIP */}
      <div className={styles.strip}>
        <Stat label="Races Completed" value={racesCount || "—"} />
        <Stat label="Drivers" value={drivers.length || "—"} />
        <Stat label="Teams" value={teams.length || "—"} />
        <Stat label="Explainers" value={newsCount ?? "—"} />
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
          <Link className={styles.featuredLink} to="/races">Full race calendar →</Link>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className={styles.quick}>
        <NavCard href="/drivers" title="Drivers & Teams"  sub={`Full ${CURRENT_SEASON} grid overview`} />
        <NavCard href="/races"   title="Races"            sub="Calendar, winners & circuits" />
        <NavCard href="/news"    title="F1 Explainers"    sub="Strategy, rules and engineering" />
        <NavCard href="/team"    title="F1 Manager"       sub="Build your dream team" />
      </section>

      {/* LEADERBOARDS */}
      <section className={styles.leaders}>
        <LeaderBlock title="Drivers Championship" link="/standings" linkLabel="Full table">
          {loading ? <SkeletonRows rows={5} /> : topDrivers.length ? topDrivers.map((d, i) => (
            <Row
              key={d.driver || i}
              pos={d.position ?? i + 1}
              name={d.driver || d.name}
              right={`${d.points ?? "—"} pts`}
              nat={d.nationality}
            />
          )) : <div className={styles.empty}>Driver standings are unavailable.</div>}
        </LeaderBlock>

        <LeaderBlock title="Constructors Championship" link="/standings?tab=teams" linkLabel="Full table">
          {loading ? <SkeletonRows rows={5} /> : topTeams.length ? topTeams.map((t, i) => (
            <Row
              key={t.team || i}
              pos={t.position ?? i + 1}
              name={t.team}
              right={`${t.points ?? "—"} pts`}
            />
          )) : <div className={styles.empty}>Constructor standings are unavailable.</div>}
        </LeaderBlock>
      </section>

      {err && <p className={styles.error} role="alert">{err}</p>}
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
    <Link className={styles.navCard} to={href}>
      <div>
        <div className={styles.navTitle}>{title}</div>
        <div className={styles.navSub}>{sub}</div>
      </div>
      <span className={styles.navArrow}>→</span>
    </Link>
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
        <Link className={styles.smallLink} to={link}>{linkLabel}</Link>
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

function SkeletonRows({ rows = 3 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <div key={i} className={styles.skelRow}>
      <div className={styles.skelDot} />
      <div className={styles.skelMid} />
      <div className={styles.skelTiny} />
    </div>
  ));
}
