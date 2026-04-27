import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "../styles/Races.module.css";
import { API_URL } from "../constants";

export default function Races() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [races, setRaces] = useState([]);     
  const [results, setResults] = useState([]); 

  // filters
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [country, setCountry] = useState("");

  // circuit preview modal
  const [preview, setPreview] = useState(null); 

  // close on ESC
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setPreview(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setErr("");
      try {
        const [resRaces, resResults] = await Promise.all([
          axios.get(`${API_URL}/api/races`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/api/raceresults`).catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        const R = Array.isArray(resRaces.data) ? resRaces.data : [];
        const W = Array.isArray(resResults.data) ? resResults.data : [];
        setRaces(R);
        setResults(W);
      } catch {
        setErr("Couldn’t reach the API.");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // normalize races + results
  const fullList = useMemo(() => {
    const make = (r) => {
      const rawDate = r.date || r.startDate || r.endDate || null;
      return {
        grandPrix: r.grandPrix || r.name || "Grand Prix",
        country: r.country || "",
        circuit: r.circuit || r.track || "",
        date: rawDate ? new Date(rawDate) : null,
        winner: r.winner || "",
        car: r.car || "",
        time: r.time || "",
        p2: r.p2 || "", p2time: r.p2time || "",
        p3: r.p3 || "", p3time: r.p3time || "",
        image: r.race || r.image || r.circuitImage || r.circuitImg || null,
      };
    };

    let list = races.length ? races.map(make) : results.map(make);

    // merge winners by GP name if both exist
    if (results.length && races.length) {
      const byName = new Map(results.map(r => [String(r.grandPrix || "").toLowerCase(), r]));
      list = list.map(x => {
        const w = byName.get(String(x.grandPrix || "").toLowerCase());
        return w ? { ...x, winner: w.winner, car: w.car, time: w.time, p2: w.p2, p2time: w.p2time, p3: w.p3, p3time: w.p3time } : x;
      });
    }

    // sort by date asc (nulls last)
    list.sort((a, b) => {
      const ta = a.date?.getTime?.() ?? Number.POSITIVE_INFINITY;
      const tb = b.date?.getTime?.() ?? Number.POSITIVE_INFINITY;
      return ta - tb;
    });
    return list;
  }, [races, results]);

  const today = new Date();
  const countries = useMemo(() => {
    const set = new Set(fullList.map(r => r.country).filter(Boolean));
    return Array.from(set).sort();
  }, [fullList]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return fullList.filter(r => {
      const matchQ =
        !term ||
        (r.grandPrix || "").toLowerCase().includes(term) ||
        (r.circuit || "").toLowerCase().includes(term) ||
        (r.country || "").toLowerCase().includes(term) ||
        (r.winner || "").toLowerCase().includes(term);
      const matchCountry = !country || r.country === country;

      let matchTime = true;
      if (filter === "future") matchTime = !r.date || r.date >= today;
      if (filter === "past")   matchTime = !!r.date && r.date < today;

      return matchQ && matchCountry && matchTime;
    });
  }, [fullList, q, country, filter, today]);

  const latest = useMemo(() => {
    const past = filtered.filter(r => r.date && r.date < today);
    if (!past.length) return null;
    return past[past.length - 1];
  }, [filtered, today]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Races</h1>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Search GP, circuit, country, winner…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="future">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <select className={styles.select} value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className={styles.btn} onClick={() => { setQ(""); setFilter("all"); setCountry(""); }}>
            Reset
          </button>
        </div>
      </header>

      {/* Latest result highlight */}
      <section className={styles.latestWrap}>
        <div className={styles.blockHeader}>
          <h3 className={styles.h3}>Latest Result</h3>
          <a className={styles.smallLink} href="/standings">See standings</a>
        </div>
        <div className={styles.latestCard}>
          {!latest ? (
            <div className={styles.empty}>No past race yet.</div>
          ) : (
            <>
              <div className={styles.latestTitle}>{latest.grandPrix}</div>
              <div className={styles.latestMeta}>
                {latest.date ? latest.date.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
                {latest.circuit && <> · {latest.circuit}</>}
                {latest.country && <> · {latest.country}</>}
              </div>
              {latest.winner && (
                <div className={styles.podium}>
                  <PodiumRow pos="1st" driver={latest.winner} time={latest.time} car={latest.car} />
                  {latest.p2 && <PodiumRow pos="2nd" driver={latest.p2} time={latest.p2time} />}
                  {latest.p3 && <PodiumRow pos="3rd" driver={latest.p3} time={latest.p3time} />}
                </div>
              )}
              {latest.image && (
                <button
                  className={styles.linkBtn}
                  onClick={() => setPreview({ src: latest.image, alt: `${latest.circuit || latest.grandPrix} circuit` })}
                >
                  View circuit map
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Calendar list */}
      <section className={styles.grid}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <div className={styles.skel} key={i} />)
        ) : filtered.length ? (
          filtered.map((r, i) => (
            <RaceCard
              key={`${r.grandPrix}-${i}`}
              r={r}
              onPreview={(src, alt) => setPreview({ src, alt })}
            />
          ))
        ) : (
          <div className={styles.empty}>No races match your filters.</div>
        )}
      </section>

      {err && <p className={styles.error}>{err}</p>}

      {/* Circuit preview modal */}
      {preview && (
        <div className={styles.previewOverlay} onClick={() => setPreview(null)}>
          <div className={styles.previewBox} onClick={(e) => e.stopPropagation()}>
            <button className={styles.previewClose} onClick={() => setPreview(null)} aria-label="Close">✕</button>
            <img
              className={styles.previewImg}
              src={preview.src}
              alt={preview.alt || "Circuit map"}
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RaceCard({ r, onPreview }) {
  const isPast = r.date && r.date < new Date();
  const hasPodium = isPast && r.winner;
  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div className={styles.dot} />
          <div className={styles.gp}>{r.grandPrix}</div>
          {!isPast && <span className={styles.badge}>Upcoming</span>}
        </div>
        <div className={styles.meta}>
          <span>{r.date ? r.date.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "TBA"}</span>
          {r.circuit && <span>• {r.circuit}</span>}
          {r.country && <span>• {r.country}</span>}
        </div>

        {hasPodium ? (
          <div className={styles.podium}>
            <PodiumRow pos="1st" driver={r.winner} time={r.time} car={r.car} />
            {r.p2 && <PodiumRow pos="2nd" driver={r.p2} time={r.p2time} />}
            {r.p3 && <PodiumRow pos="3rd" driver={r.p3} time={r.p3time} />}
          </div>
        ) : !isPast && r.winner ? (
          <div className={styles.resultRow}>
            <div className={styles.label}>Defending winner</div>
            <div className={styles.value}>{r.winner}</div>
          </div>
        ) : null}

        {r.image && (
          <button
            className={styles.linkBtn}
            onClick={() => onPreview(r.image, `${r.circuit || r.grandPrix} circuit`)}
          >
            View circuit map
          </button>
        )}
      </div>
    </article>
  );
}

function PodiumRow({ pos, driver, time, car }) {
  const posClass = pos === "1st" ? styles.pos1 : pos === "2nd" ? styles.pos2 : styles.pos3;
  return (
    <div className={styles.podiumRow}>
      <span className={`${styles.podPos} ${posClass}`}>{pos}</span>
      <span className={styles.podDriver}>{driver}{car ? <span className={styles.podCar}> · {car}</span> : null}</span>
      <span className={styles.podTime}>{time}</span>
    </div>
  );
}
