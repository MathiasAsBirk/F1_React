import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/DreamTeam.module.css";
import { STORAGE_KEYS } from "../constants";

/* --- Game data & simulation (extracted to keep this file lean) --- */
import {
  DRIVERS, CHASSIS, ENGINES, PRINCIPALS, PIT,
  TRACKS, CALENDAR, SPONSORS,
  MAX_WALLET, DAILY_CAP, COOLDOWN_MS, UPGRADE_COST,
} from "../game/gameData";
import { costOf, computeStats, clamp, initials, weekend, autoSeason } from "../game/gameSim";

/* ================================================================
   STORAGE
================================================================ */
const LS_KEY    = STORAGE_KEYS.MANAGER_SAVE;
const SLOTS_KEY = STORAGE_KEYS.MANAGER_SLOTS;

function loadSlots() {
  try { return JSON.parse(localStorage.getItem(SLOTS_KEY)) || { slot1: null, slot2: null, slot3: null }; }
  catch { return { slot1: null, slot2: null, slot3: null }; }
}
function saveSlots(slots) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

const upgradeCost = (lvl) => UPGRADE_COST[Math.min(lvl, 4)];

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Manager() {
  const [teamName, setTeamName] = useState("Your F1 Team");
  const [budget,   setBudget]   = useState(110);
  const [sel, setSel] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.sel || { d1: "", d2: "", ch: "", pu: "", tp: "", pit: "stock" };
  });
  const [track, setTrack] = useState("balanced");
  const [dev, setDev] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.dev || { points: 0, aero: 0, power: 0, mech: 0, rel: 0, pit: 0 };
  });
  const [funds, setFunds] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.funds ?? 0;
  });
  const [sponsor, setSponsor] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.sponsor || "bronze";
  });
  const [lastWeekend, setLastWeekend] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.lastWeekend || null;
  });
  const [season, setSeason] = useState(null);
  const [seasonYear, setSeasonYear] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.seasonYear || 2025;
  });
  const [history, setHistory] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.history || [];
  });
  const [slots, setSlots] = useState(loadSlots);

  // Anti-spam: daily cap + cooldown
  const [limit, setLimit] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.limit || { date: new Date().toDateString(), earned: 0 };
  });
  const [nextAllowedAt, setNextAllowedAt] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return saved.nextAllowedAt || 0;
  });

  // Persist on every relevant state change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({
      sel, dev, teamName, budget, lastWeekend, season,
      seasonYear, history, sponsor, funds, limit, nextAllowedAt,
    }));
  }, [sel, dev, teamName, budget, lastWeekend, season, seasonYear, history, sponsor, funds, limit, nextAllowedAt]);

  /* ---------- Derived ---------- */
  const total     = costOf(sel);
  const remaining = budget - total;
  const canRace   = sel.d1 && sel.d2 && sel.ch && sel.pu && sel.tp && sel.pit && remaining >= 0;
  const stats     = computeStats(sel, track, dev);

  /* ---------- Select options ---------- */
  const driverOptions = (other) => DRIVERS.map((d) => (
    <option key={d.id} value={d.id} disabled={d.id === other}>
      {d.flag} {d.name} — {d.team} · {d.cost}
    </option>
  ));
  const chassisOptions = CHASSIS.map((c)   => <option key={c.id} value={c.id}>{c.name} · {c.cost}</option>);
  const engineOptions  = ENGINES.map((e)   => <option key={e.id} value={e.id}>{e.name} · {e.cost}</option>);
  const tpOptions      = PRINCIPALS.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.cost}</option>);
  const pitOptions     = PIT.map((p)        => <option key={p.id} value={p.id}>{p.name} · {p.cost}</option>);
  const trackOptions   = TRACKS.map((t)     => <option key={t.id} value={t.id}>{t.name}</option>);

  /* ---------- Pickers ---------- */
  const setPick = (k, v) => {
    if ((k === "d1" && v === sel.d2) || (k === "d2" && v === sel.d1)) return alert("Pick two different drivers 🙂");
    setSeason(null);
    setLastWeekend(null);
    setSel((s) => ({ ...s, [k]: v }));
  };

  /* ---------- Economy helpers ---------- */
  function addDevPoints(n) {
    setDev((d) => ({ ...d, points: Math.min(MAX_WALLET, d.points + n) }));
  }
  function canEarn(n = 0) {
    const today = new Date().toDateString();
    if (limit.date !== today) { setLimit({ date: today, earned: 0 }); return true; }
    return limit.earned + n <= DAILY_CAP;
  }
  function earn(n) {
    const today = new Date().toDateString();
    setLimit((l) => l.date !== today ? { date: today, earned: n } : { ...l, earned: l.earned + n });
    addDevPoints(n);
  }
  function gate() {
    const now = Date.now();
    if (now < nextAllowedAt) { alert(`Cooldown… wait ${Math.ceil((nextAllowedAt - now) / 1000)}s`); return false; }
    setNextAllowedAt(now + COOLDOWN_MS);
    return true;
  }

  /* ---------- Sponsor payouts ---------- */
  function sponsorPayout(wk) {
    const sp      = SPONSORS.find((s) => s.id === sponsor) || SPONSORS[0];
    let payout    = sp.base;
    const you     = wk.results.filter((r) => r.isUser);
    const bestPos = Math.min(...you.map((r) => r.pos));
    const bothScored = you.filter((x) => x.points > 0).length === 2;
    const pole    = wk.quali[0]?.isUser;
    const fastest = !wk.safetyCar && Math.random() < 0.18 && you.some((x) => !x.dnf);

    if (sp.bonus.podium       && bestPos <= 3)   payout += sp.bonus.podium;
    if (sp.bonus.doublePoints && bothScored)      payout += sp.bonus.doublePoints;
    if (sp.bonus.pole         && pole)            payout += sp.bonus.pole;
    if (sp.bonus.fastest      && fastest)         payout += sp.bonus.fastest;

    setFunds((f) => f + payout);
    return payout;
  }

  /* ---------- Upgrades ---------- */
  const buy = (key) => {
    const lvl  = dev[key];
    const cost = upgradeCost(lvl);
    if (dev.points < cost) return;
    setDev((d) => ({ ...d, [key]: lvl + 1, points: d.points - cost }));
  };

  /* ---------- Funds converters ---------- */
  function buyDevWithFunds()    { if (funds < 2)              return alert("Need 2 funds");           if (dev.points >= MAX_WALLET) return alert("Dev Point wallet full"); setFunds((f) => f - 2); addDevPoints(1); }
  function buyBudgetWithFunds() { if (funds < 3)              return alert("Need 3 funds");           setFunds((f) => f - 3); setBudget((b) => Math.min(140, b + 1)); }

  /* ---------- Reset & slots ---------- */
  function reset() {
    setSel({ d1: "", d2: "", ch: "", pu: "", tp: "", pit: "stock" });
    setDev({ points: 0, aero: 0, power: 0, mech: 0, rel: 0, pit: 0 });
    setSeason(null); setLastWeekend(null); setBudget(110); setTeamName("Your F1 Team");
    setFunds(0); setSponsor("bronze");
  }
  function snapshot() {
    return {
      meta:  { savedAt: Date.now(), seasonYear, teamName, sponsor },
      state: { sel, dev, budget, lastWeekend, season, history, seasonYear, sponsor, funds, limit, nextAllowedAt },
    };
  }
  function restore(snap) {
    if (!snap) return;
    const { state } = snap;
    setSel(state.sel);            setDev(state.dev);
    setBudget(state.budget);      setLastWeekend(state.lastWeekend || null);
    setSeason(state.season || null); setHistory(state.history || []);
    setSeasonYear(state.seasonYear || 2025); setSponsor(state.sponsor || "bronze");
    setFunds(state.funds ?? 0);
    setLimit(state.limit || { date: new Date().toDateString(), earned: 0 });
    setNextAllowedAt(state.nextAllowedAt || 0);
  }
  function saveToSlot(key)   { const next = { ...slots, [key]: snapshot() }; setSlots(next); saveSlots(next); }
  function loadFromSlot(key) { if (!slots[key]) return alert("Empty slot"); restore(slots[key]); }
  function deleteSlot(key)   { if (!slots[key] || !confirm("Delete this save?")) return; const next = { ...slots, [key]: null }; setSlots(next); saveSlots(next); }

  /* ---------- Simulate ---------- */
  function runWeekend() {
    if (!canRace || !gate()) return;
    const wk  = weekend(sel, track, dev);
    setLastWeekend({ gp: "Exhibition", track, ...wk });

    const you     = wk.results.filter((r) => r.isUser);
    const bestPos = Math.min(...you.map((r) => r.pos));
    let gained    = Math.max(0, 6 - bestPos);
    if (you.filter((x) => x.points > 0).length === 2) gained += 2;
    if (gained > 0 && canEarn(gained)) earn(gained);
    sponsorPayout(wk);
  }

  function runAutoSeason() {
    if (!canRace || !gate()) return;
    const s = autoSeason(sel, dev);
    setSeason(s);

    const consChamp = s.cons[0]?.team    || "—";
    const drvChamp  = s.drivers[0]?.name || "—";
    setHistory((h) => [{ year: seasonYear, consChampion: consChamp, drvChampion: drvChamp }, ...h].slice(0, 20));
    setSeasonYear((y) => y + 1);

    const youConstructor = s.cons.find((t) => t.team === "You");
    const bonus = youConstructor ? Math.round(youConstructor.pts / 25) : 0;
    if (bonus > 0 && canEarn(bonus)) earn(bonus);

    const base      = SPONSORS.find((sp) => sp.id === sponsor)?.base ?? 3;
    const top3      = s.cons.slice(0, 3).some((t) => t.team === "You");
    const totalFunds = 16 * base + (top3 ? 10 : 4);
    setFunds((f) => f + totalFunds);
  }

  /* ---------- UI helpers ---------- */
  const cooldownLeft = Math.max(0, nextAllowedAt - Date.now());
  const cooldownSecs = Math.ceil(cooldownLeft / 1000);

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.h1}>🛠️ F1 Manager — Build • Upgrade • Win</h1>
          <div className={styles.actions}>
            <div className={styles.devBadgePro}>Season: <strong>{seasonYear}</strong></div>
            <button className={styles.btn} onClick={reset}>Reset</button>
          </div>
        </header>

        {/* PROFILES */}
        <div className={styles.simBlock}>
          <div className={styles.simHeader}>
            <h3 className={styles.h3}>Profiles</h3>
            <div className={styles.devBadgePro}>Dev Pts: <strong>{dev.points}/{MAX_WALLET}</strong></div>
          </div>
          <div className={styles.profileGrid}>
            {["slot1", "slot2", "slot3"].map((key, i) => {
              const snap  = slots[key];
              const title = snap ? (snap.meta.teamName || `Career ${i + 1}`) : `Empty Slot ${i + 1}`;
              const sub   = snap ? new Date(snap.meta.savedAt).toLocaleString() : "—";
              return (
                <div key={key} className={styles.profileCard}>
                  <div className={styles.profileHead}>
                    <div className={styles.profileTitle}>{title}</div>
                    <div className={styles.profileSub}>{sub}</div>
                  </div>
                  <div className={styles.profileBtns}>
                    <button className={styles.btnGhost}   onClick={() => saveToSlot(key)}>Save</button>
                    <button className={styles.btnPrimary} disabled={!snap} onClick={() => loadFromSlot(key)}>Load</button>
                    <button className={styles.btnDanger}  disabled={!snap} onClick={() => deleteSlot(key)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
          {history.length > 0 && (
            <>
              <h4 style={{ marginTop: 12 }}>Career History</h4>
              <ul className={styles.historyList}>
                {history.slice(0, 8).map((h, idx) => (
                  <li key={idx}><strong>{h.year}</strong> — Constructors: {h.consChampion} · Drivers: {h.drvChampion}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* SPONSOR / ECONOMY */}
        <div className={styles.simBlock}>
          <div className={styles.simHeader}>
            <h3 className={styles.h3}>Sponsorship & Economy</h3>
            <div className={styles.fundsBadge}>Funds: <strong>{funds}</strong></div>
          </div>
          <div className={styles.sponsorGrid}>
            {SPONSORS.map((sp) => (
              <div
                key={sp.id}
                className={`${styles.sponsorCard} ${sponsor === sp.id ? styles.active : ""}`}
                onClick={() => setSponsor(sp.id)}
              >
                <div className={styles.sponsorHeader}>
                  <div className={styles.sponsorTitle}>{sp.name}</div>
                  <div className={styles.sponsorPill}>Base +{sp.base}</div>
                </div>
                <div className={styles.sponsorDesc}>{sp.desc}</div>
                <div className={styles.sponsorPerks}>
                  {Object.entries(sp.bonus).map(([k, v]) => <div key={k} className={styles.perk}>+{v} {k}</div>)}
                </div>
                <div className={styles.sponsorPick}>{sponsor === sp.id ? "Selected" : "Pick"}</div>
              </div>
            ))}
          </div>
          <div className={styles.convertRow}>
            <button className={styles.btn} onClick={buyDevWithFunds}>Convert 2 Funds → +1 Dev Pt</button>
            <button className={styles.btn} onClick={buyBudgetWithFunds}>Convert 3 Funds → +1 Budget Cap</button>
            <div className={styles.capNote}>Daily Dev cap: {limit.earned}/{DAILY_CAP}</div>
          </div>
        </div>

        {/* BUILDER */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.label}>Team name</label>
            <input className={styles.input} value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlCol}>
              <label className={styles.label}>Driver 1</label>
              <select className={styles.select} value={sel.d1} onChange={(e) => setPick("d1", e.target.value)}>
                <option value="">— Select —</option>{driverOptions(sel.d2)}
              </select>
            </div>
            <div className={styles.controlCol}>
              <label className={styles.label}>Driver 2</label>
              <select className={styles.select} value={sel.d2} onChange={(e) => setPick("d2", e.target.value)}>
                <option value="">— Select —</option>{driverOptions(sel.d1)}
              </select>
            </div>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlCol}>
              <label className={styles.label}>Chassis</label>
              <select className={styles.select} value={sel.ch} onChange={(e) => setPick("ch", e.target.value)}>
                <option value="">— Select —</option>{chassisOptions}
              </select>
            </div>
            <div className={styles.controlCol}>
              <label className={styles.label}>Engine</label>
              <select className={styles.select} value={sel.pu} onChange={(e) => setPick("pu", e.target.value)}>
                <option value="">— Select —</option>{engineOptions}
              </select>
            </div>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlCol}>
              <label className={styles.label}>Team Principal</label>
              <select className={styles.select} value={sel.tp} onChange={(e) => setPick("tp", e.target.value)}>
                <option value="">— Select —</option>{tpOptions}
              </select>
            </div>
            <div className={styles.controlCol}>
              <label className={styles.label}>Pit Crew</label>
              <select className={styles.select} value={sel.pit} onChange={(e) => setPick("pit", e.target.value)}>
                {pitOptions}
              </select>
            </div>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.controlCol}>
              <label className={styles.label}>Track (for Weekend)</label>
              <select className={styles.select} value={track} onChange={(e) => setTrack(e.target.value)}>
                {trackOptions}
              </select>
            </div>
            <div className={styles.controlCol}>
              <label className={styles.label}>Budget</label>
              <input
                type="number" className={styles.input} min={90} max={140} value={budget}
                onChange={(e) => setBudget(Number(e.target.value || 110))}
              />
              <div className={styles.budgetBarWrap}>
                <div className={styles.budgetBar}>
                  <div
                    className={`${styles.budgetFill} ${budget - total < 0 ? styles.over : ""}`}
                    style={{ width: `${Math.min(100, Math.round((total / Math.max(1, budget)) * 100))}%` }}
                  />
                </div>
                <div className={styles.budgetText}>
                  Total {total} / {budget} • {budget - total >= 0 ? `${budget - total} left` : `${total - budget} over`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM CARD */}
        <div className={styles.card} style={{ ["--team"]: stats.color }}>
          <div className={styles.cardHeader}>
            <div className={styles.badge} />
            <div>
              <div className={styles.cardTitle}>{teamName}</div>
              <div className={styles.cardSub}>
                {sel.ch ? CHASSIS.find((c) => c.id === sel.ch)?.name : "—"} •{" "}
                {sel.pu ? ENGINES.find((e) => e.id === sel.pu)?.name : "—"} •{" "}
                {sel.tp ? PRINCIPALS.find((p) => p.id === sel.tp)?.name : "—"}
              </div>
            </div>
            <div className={styles.overall}>
              <div className={styles.overallNum}>{stats.overall || "—"}</div>
              <div className={styles.overallLabel}>OVR</div>
            </div>
          </div>
          <div className={styles.driversRow}>
            <DriverChip id={sel.d1} />
            <DriverChip id={sel.d2} />
          </div>
          <div className={styles.statsGrid}>
            <StatBar label="Pace"        value={stats.pace}        />
            <StatBar label="Quali"       value={stats.quali}       />
            <StatBar label="Race"        value={stats.race}        />
            <StatBar label="Reliability" value={stats.reliability} />
          </div>
        </div>

        {/* UPGRADES */}
        <div className={`${styles.simBlock} ${styles.upgradesBlock}`}>
          <div className={styles.simHeader}>
            <h3 className={styles.h3}>Upgrades</h3>
            <div className={styles.devBadgePro}>Dev Pts: <strong>{dev.points}/{MAX_WALLET}</strong></div>
          </div>
          <p className={styles.simHint}>
            Lv cost: 3,4,5,6,8. Effects/level → <b>Aero</b> +1.5, <b>Power</b> +1.4,{" "}
            <b>Mechanical</b> +1.5 grip / +0.6 tire / −0.8 weight,{" "}
            <b>Reliability</b> +1.6, <b>Pit</b> +1.8 stop / +1.0 rel.
          </p>
          <div className={styles.upgradeGrid}>
            <UpgradeCard name="Aero"        lvl={dev.aero}  cost={upgradeCost(dev.aero)}  can={dev.points >= upgradeCost(dev.aero)}  onBuy={() => buy("aero")}  desc="Downforce for fast corners; big on high-DF tracks." />
            <UpgradeCard name="Power Unit"  lvl={dev.power} cost={upgradeCost(dev.power)} can={dev.points >= upgradeCost(dev.power)} onBuy={() => buy("power")} desc="Top speed & deployment; huge on power tracks." />
            <UpgradeCard name="Mechanical"  lvl={dev.mech}  cost={upgradeCost(dev.mech)}  can={dev.points >= upgradeCost(dev.mech)}  onBuy={() => buy("mech")}  desc="Mech grip, tire life, lower weight; loves street tracks." />
            <UpgradeCard name="Reliability" lvl={dev.rel}   cost={upgradeCost(dev.rel)}   can={dev.points >= upgradeCost(dev.rel)}   onBuy={() => buy("rel")}   desc="Fewer DNFs; steadier long-run pace." />
            <UpgradeCard name="Pit Crew"    lvl={dev.pit}   cost={upgradeCost(dev.pit)}   can={dev.points >= upgradeCost(dev.pit)}   onBuy={() => buy("pit")}   desc="Faster, cleaner stops & better pit reliability." />
          </div>
        </div>

        {/* WEEKEND */}
        <div className={styles.simBlock}>
          <div className={styles.simHeader}>
            <h3 className={styles.h3}>Race Weekend</h3>
            <div className={styles.actions}>
              <button className={styles.btn} disabled={!canRace || cooldownLeft > 0} onClick={runWeekend}>
                {cooldownLeft > 0 ? `Wait ${cooldownSecs}s` : "Simulate Weekend"}
              </button>
              <button className={styles.btn} disabled={!canRace || cooldownLeft > 0} onClick={runAutoSeason}>
                {cooldownLeft > 0 ? `Wait ${cooldownSecs}s` : "Run Season (auto)"}
              </button>
            </div>
          </div>
          {!canRace && <p className={styles.simHint}>Select your full lineup and stay under budget to enable.</p>}
          {lastWeekend && (
            <div className={styles.gridWeekend}>
              <div>
                <h4>Qualifying — {TRACKS.find((t) => t.id === track)?.name}</h4>
                <ol className={styles.resultsList}>
                  {lastWeekend.quali.slice(0, 10).map((q) => (
                    <li key={`q-${q.pos}`} className={q.isUser ? styles.you : ""}>
                      <strong>P{q.pos}</strong> {q.driver} {q.isUser ? "(You)" : `— ${q.team}`}{" "}
                      <span className={styles.score}>({Math.round(q.score)})</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4>Race — {lastWeekend.safetyCar ? "with Safety Car" : "green"}</h4>
                <ol className={styles.resultsList}>
                  {lastWeekend.results.slice(0, 10).map((r) => (
                    <li key={`r-${r.pos}`} className={r.isUser ? styles.you : ""}>
                      <strong>#{r.pos}</strong> {r.driver} {r.isUser ? "(You)" : `— ${r.team}`}
                      {r.dnf && <em> DNF</em>}
                      {r.points ? <span className={styles.points}>+{r.points}</span> : null}
                      <span className={styles.score}>({r.score})</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* SEASON */}
        {season && (
          <div className={styles.simBlock}>
            <div className={styles.simHeader}><h3 className={styles.h3}>Season Results</h3></div>
            <div className={styles.gridSeason}>
              <div>
                <h4>Constructors</h4>
                <ol className={styles.resultsList}>
                  {season.cons.map((t, i) => (
                    <li key={t.team} className={t.team === "You" ? styles.you : ""}>
                      <strong>{i + 1}.</strong> {t.team} <span className={styles.points}>{t.pts} pts</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4>Drivers (Top 10)</h4>
                <ol className={styles.resultsList}>
                  {season.drivers.slice(0, 10).map((d, i) => (
                    <li key={d.name}>
                      <strong>{i + 1}.</strong> {d.name} <span className={styles.points}>{d.pts} pts</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <details className={styles.details}>
              <summary>Per-race breakdown</summary>
              {season.perRace.map((r, idx) => (
                <div key={idx} className={styles.raceCard}>
                  <div className={styles.raceTitle}>{idx + 1}. {r.gp} — {TRACKS.find((t) => t.id === r.track)?.name}</div>
                  <ol className={styles.resultsList}>
                    {r.results.slice(0, 10).map((x) => (
                      <li key={x.pos} className={x.isUser ? styles.you : ""}>
                        <strong>#{x.pos}</strong> {x.driver} {x.isUser ? "(You)" : `— ${x.team}`}
                        {x.dnf && <em> DNF</em>}
                        <span className={styles.points}>{x.points ? `+${x.points}` : ""}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Small UI components
================================================================ */
function DriverChip({ id }) {
  if (!id) return <div className={styles.driverEmpty}>No driver</div>;
  const d = DRIVERS.find((x) => x.id === id);
  return (
    <div className={styles.driverChip}>
      <div className={styles.avatar}>{initials(d.name)}</div>
      <div className={styles.driverMeta}>
        <div className={styles.driverName}>{d.flag} {d.name}</div>
        <div className={styles.driverSub}>{d.team} · Cost {d.cost}</div>
      </div>
    </div>
  );
}

function StatBar({ label, value = 0 }) {
  const v = clamp(value);
  return (
    <div className={styles.stat}>
      <div className={styles.statHeader}><span>{label}</span><span className={styles.statNum}>{v}</span></div>
      <div className={styles.statBar}><div className={styles.statFill} style={{ width: `${v}%` }} /></div>
    </div>
  );
}

function UpgradeCard({ name, lvl, cost, can, onBuy, desc }) {
  const pct = Math.min(100, lvl * 20);
  return (
    <div className={styles.upgradeCard}>
      <div className={styles.upgradeHeader}>
        <div className={styles.upgradeTitle}>{name}</div>
        <div className={styles.upgradeCostPill}>Next: {cost} pts</div>
      </div>
      <div className={styles.upgradeDesc}>{desc}</div>
      <div className={styles.upgradeBar} aria-label={`Progress ${pct}%`}>
        <div className={styles.upgradeBarFill} style={{ width: `${pct}%` }} />
        <div className={styles.upgradeTicks}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`${styles.tick} ${lvl >= i ? styles.done : ""}`} />
          ))}
        </div>
      </div>
      <div className={styles.upgradeFooter}>
        <div className={styles.upgradeLevel}>Level {lvl} / 5</div>
        <button className={styles.upgradeBuyBtn} disabled={!can} onClick={onBuy}>Buy</button>
      </div>
    </div>
  );
}
