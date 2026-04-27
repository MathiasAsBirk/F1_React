import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import styles from "./infodriver.module.css";
import driverStats from "../infoDriver/data/driverStats.json";
import { API_URL } from "../../constants";

export default function Infodriver() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [natFilter, setNatFilter] = useState("");

  const [selected, setSelected] = useState(null);
  const modalCloseBtnRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(""); setLoading(true);
        const res = await axios.get(`${API_URL}/api/teams`);
        if (!mounted) return;
        setTeams(Array.isArray(res.data) ? res.data : []);
      } catch {
        setErr("Couldn’t load teams right now.");
        setTeams([]);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const teamOptions = useMemo(
    () => Array.from(new Set(teams.map(t => t.team))).sort(),
    [teams]
  );

  const natOptions = useMemo(() => {
    const set = new Set();
    teams.forEach(t => (t.drivers || []).forEach(d => d?.country && set.add(d.country)));
    return Array.from(set).sort();
  }, [teams]);

  const visibleTeams = useMemo(() => {
    const term = q.trim().toLowerCase();
    return teams
      .map(t => {
        let ds = Array.isArray(t.drivers) ? [...t.drivers] : [];
        if (teamFilter && t.team !== teamFilter) ds = [];
        ds = ds.filter(d => {
          const matchQ =
            !term ||
            (d.name || "").toLowerCase().includes(term) ||
            (d.num ? String(d.num) : "").includes(term) ||
            (t.team || "").toLowerCase().includes(term);
          const matchNat = !natFilter || d.country === natFilter;
          return matchQ && matchNat;
        });
        return { ...t, drivers: ds };
      })
      .filter(t => t.drivers.length > 0 || (!teamFilter && !q && !natFilter));
  }, [teams, q, teamFilter, natFilter]);

  useEffect(() => {
    const onEsc = e => { if (e.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  useEffect(() => {
    if (selected && modalCloseBtnRef.current) modalCloseBtnRef.current.focus();
  }, [selected]);

  const findStats = (name) => {
    if (!name) return null;
    const key = name.toLowerCase().trim();
    if (driverStats[key]) return driverStats[key];
    const parts = key.split(" "); const last = parts[parts.length - 1];
    return driverStats[last] || null;
  };

  const openModal = (driver, team, color) => {
    setSelected({
      ...driver,
      team,
      color,
      _stats: findStats(driver.name)
    });
  };

  const teamCarImage = (team) =>
    team?.car || team?.carImage || team?.image || (team?.drivers?.[0]?.car ?? null);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Drivers & Teams</h1>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Search driver, number, or team…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select className={styles.select} value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
            <option value="">All teams</option>
            {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={styles.select} value={natFilter} onChange={e => setNatFilter(e.target.value)}>
            <option value="">All nationalities</option>
            {natOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button className={styles.btn} onClick={() => { setQ(""); setTeamFilter(""); setNatFilter(""); }}>
            Reset
          </button>
        </div>
      </header>

      <section className={styles.container}>
        {err && <div className={styles.error}>{err}</div>}

        {loading ? (
          <div className={styles.skelGrid}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skelCard} />)}
          </div>
        ) : (
          visibleTeams.map(team => {
            const accent = team.color || "#3a3a3a";
            const car = teamCarImage(team);
            return (
              <article
                key={team.team}
                className={styles.teamBlock}
                style={{ borderLeftColor: accent, ["--accent"]: accent }}
              >
                {/* Team hero: team name, driver chips (as buttons), compact car */}
                <div className={styles.teamHero}>
                  <div className={styles.heroTop}>
                    <h2 className={styles.teamName}>{team.team}</h2>
                    {team.logo && (
                      <img
                        className={styles.teamLogo}
                        src={team.logo}
                        alt={`${team.team} logo`}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                  </div>

                  <div className={styles.driverChips}>
                    {(team.drivers || []).map((d) => (
                      <button
                        key={d.name}
                        className={styles.chipBtn}
                        onClick={() => openModal(d, team.team, team.color)}
                        aria-label={`Open ${d.name} details`}
                      >
                        {d.photo && (
                          <img
                            src={d.photo}
                            alt=""
                            className={styles.chipAvatar}
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        )}
                        <span className={styles.chipText}>
                          {d.name?.split(" ").slice(0, -1).join(" ")}{" "}
                          <strong>{d.name?.split(" ").slice(-1)[0]}</strong>
                        </span>
                      </button>
                    ))}
                  </div>

                  {car && (
                    <img
                      className={styles.teamCarImg}
                      src={car}
                      alt={`${team.team} car`}
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>
              </article>
            );
          })
        )}

        {!loading && visibleTeams.length === 0 && (
          <div className={styles.empty}>No matches. Try different filters.</div>
        )}
      </section>

      {/* Driver modal (same content as before, opened via chips) */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div
            className={styles.modal}
            onClick={e => e.stopPropagation()}
            style={{ borderTopColor: selected.color || "#e10600" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="driver-modal-title"
          >
            <button
              className={styles.modalClose}
              onClick={() => setSelected(null)}
              aria-label="Close"
              ref={modalCloseBtnRef}
            >
              ✕
            </button>

            <div className={styles.modalGrid}>
              <div className={styles.modalLeft}>
                <ImageOrInitials src={selected.photo} name={selected.name} className={styles.modalPhoto} />
                {selected.car && <img src={selected.car} alt={`${selected.team} car`} className={styles.modalCar} />}
              </div>

              <div className={styles.modalRight}>
                <h3 id="driver-modal-title" className={styles.modalTitle}>{selected.name}</h3>

                <ul className={styles.infoList}>
                  {selected.num != null && <li><b>No.</b> {selected.num}</li>}
                  <li><b>Team</b> {selected.team || "—"}</li>
                  <li><b>Country</b> {selected.country || "—"}</li>
                  {"age" in selected && <li><b>Age</b> {selected.age}</li>}
                </ul>

                <div className={styles.statsBlock}>
                  <h4 className={styles.statsTitle}>Career Stats</h4>
                  <div className={styles.statsGrid}>
                    <Stat label="GP Entered" value={selected._stats?.gpEntered} />
                    <Stat label="Career Points" value={selected._stats?.careerPoints} />
                    <Stat label="Highest Race Finish" value={selected._stats?.bestFinish} />
                    <Stat label="Podiums" value={selected._stats?.podiums} />
                    <Stat label="Highest Grid Position" value={selected._stats?.bestGrid} />
                    <Stat label="Pole Positions" value={selected._stats?.poles} />
                    <Stat label="World Championships" value={selected._stats?.worldChamps} />
                    <Stat label="DNFs" value={selected._stats?.dnfs} />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  {selected.flag && <img src={selected.flag} alt={`${selected.country} flag`} className={styles.flagBig} />}
                  <button className={styles.btnPrimary} onClick={() => setSelected(null)}>Close</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* helpers */
function ImageOrInitials({ src, name, className }) {
  const [ok, setOk] = useState(true);
  const initials = (name || "?").split(" ").map(p => p[0]).join("").slice(0,3).toUpperCase();
  if (ok && src) {
    return <img src={src} alt={name || "Driver"} className={className} onError={() => setOk(false)} />;
  }
  return <div className={styles.initials} aria-label={name}>{initials}</div>;
}

function Stat({ label, value }) {
  return (
    <div className={styles.statItem}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value ?? "—"}</div>
    </div>
  );
}
