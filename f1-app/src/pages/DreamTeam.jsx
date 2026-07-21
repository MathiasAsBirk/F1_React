import { useEffect, useMemo, useState } from "react";
import styles from "../styles/DreamTeam.module.css";
import { CURRENT_SEASON, STORAGE_KEYS } from "../constants";
import {
  DRIVERS,
  CHASSIS,
  ENGINES,
  PRINCIPALS,
  PIT,
  TRACKS,
  CALENDAR,
  SPONSORS,
  MAX_WALLET,
  UPGRADE_COST,
} from "../game/gameData";
import { clamp, computeStats, costOf, initials, weekend } from "../game/gameSim";

const SAVE_VERSION = 3;
const LS_KEY = STORAGE_KEYS.MANAGER_SAVE;
const SLOTS_KEY = STORAGE_KEYS.MANAGER_SLOTS;
const EMPTY_SELECTION = { d1: "", d2: "", ch: "", pu: "", tp: "", pit: "stock" };
const EMPTY_DEV = { points: 5, aero: 0, power: 0, mech: 0, rel: 0, pit: 0 };

const SETUPS = [
  { id: "balanced", name: "Balanced", detail: "Safe across every circuit type" },
  { id: "downforce", name: "High downforce", detail: "Best for technical and street tracks" },
  { id: "speed", name: "Low drag", detail: "Best on power circuits" },
];

const STRATEGIES = [
  { id: "attack", name: "Attack", detail: "+Pace · +wear · +risk" },
  { id: "balanced", name: "Balanced", detail: "Measured pace and component use" },
  { id: "conserve", name: "Conserve", detail: "Protect the car and reduce risk" },
];

const PIT_PLANS = [
  { id: "oneStop", name: "One stop", detail: "Rewards tyre conservation" },
  { id: "flexible", name: "Flexible", detail: "React quickly to safety cars" },
  { id: "twoStop", name: "Two stop", detail: "Push harder on demanding tracks" },
];

function freshCareer() {
  return {
    version: SAVE_VERSION,
    teamName: "Vanguard Racing",
    budget: 110,
    funds: 12,
    sponsor: "northstar",
    seasonYear: CURRENT_SEASON,
    roundIndex: 0,
    sel: { ...EMPTY_SELECTION },
    dev: { ...EMPTY_DEV },
    setup: "balanced",
    strategy: "balanced",
    pitPlan: "flexible",
    carWear: { powerUnit: 0, gearbox: 0 },
    standings: { drivers: {}, constructors: {} },
    weekendHistory: [],
    history: [],
    lastWeekend: null,
  };
}

function safeParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function normalizeCareer(raw) {
  const base = freshCareer();
  if (!raw || typeof raw !== "object") return base;
  const oldSponsor = { bronze: "northstar", silver: "apex", gold: "velocity" }[raw.sponsor];
  const sponsor = SPONSORS.some((item) => item.id === raw.sponsor)
    ? raw.sponsor
    : oldSponsor || base.sponsor;

  const history = Array.isArray(raw.history) ? raw.history.map((season) => ({
    year: season.year,
    constructorsChampion: season.constructorsChampion || season.consChampion || "—",
    driversChampion: season.driversChampion || season.drvChampion || "—",
    teamPosition: season.teamPosition || "—",
  })) : [];
  const rawDev = { ...base.dev, ...(raw.dev || {}) };

  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    teamName: typeof raw.teamName === "string" && raw.teamName.trim() ? raw.teamName : base.teamName,
    budget: clamp(Number(raw.budget) || base.budget, 90, 140),
    funds: Math.max(0, Number(raw.funds) || 0),
    sponsor,
    roundIndex: clamp(Number(raw.roundIndex) || 0, 0, CALENDAR.length),
    sel: { ...base.sel, ...(raw.sel || {}) },
    dev: {
      ...rawDev,
      aero: clamp(rawDev.aero, 0, 5),
      power: clamp(rawDev.power, 0, 5),
      mech: clamp(rawDev.mech, 0, 5),
      rel: clamp(rawDev.rel, 0, 5),
      pit: clamp(rawDev.pit, 0, 5),
      points: clamp(rawDev.points, 0, MAX_WALLET),
    },
    carWear: { ...base.carWear, ...(raw.carWear || {}) },
    standings: {
      drivers: { ...(raw.standings?.drivers || {}) },
      constructors: { ...(raw.standings?.constructors || {}) },
    },
    weekendHistory: Array.isArray(raw.weekendHistory) ? raw.weekendHistory : [],
    history,
    lastWeekend: raw.lastWeekend?.wearAdded ? raw.lastWeekend : null,
  };
}

function loadCareer() {
  return normalizeCareer(safeParse(safeStorageGet(LS_KEY)));
}

function loadSlots() {
  const parsed = safeParse(safeStorageGet(SLOTS_KEY), {});
  return { slot1: null, slot2: null, slot3: null, ...(parsed || {}) };
}

function upgradeCost(level) {
  return level >= 5 ? null : UPGRADE_COST[level];
}

function addStanding(table, key, points) {
  table[key] = (table[key] || 0) + points;
}

function sortedStandings(table) {
  return Object.entries(table)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

function sponsorReward(raceWeekend, sponsorId) {
  const deal = SPONSORS.find((item) => item.id === sponsorId) || SPONSORS[0];
  const userResults = raceWeekend.results.filter((result) => result.isUser);
  const bestPosition = Math.min(...userResults.map((result) => result.pos));
  const bothClassified = userResults.every((result) => !result.dnf);
  const scored = userResults.some((result) => result.points > 0);
  const bothScored = userResults.every((result) => result.points > 0);
  const pole = raceWeekend.quali[0]?.isUser;
  const fastest = userResults.some((result) => result.fastestLap);
  const targetMet = deal.objectiveKey === "classified"
    ? bothClassified
    : deal.objectiveKey === "points"
      ? scored
      : bestPosition <= 3;

  let total = deal.base + (targetMet ? deal.targetBonus : 0);
  if (deal.bonus.doublePoints && bothScored) total += deal.bonus.doublePoints;
  if (deal.bonus.pole && pole) total += deal.bonus.pole;
  if (deal.bonus.fastest && fastest) total += deal.bonus.fastest;
  return { total, targetMet, deal };
}

export default function Manager() {
  const [career, setCareer] = useState(loadCareer);
  const [slots, setSlots] = useState(loadSlots);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(career));
    } catch {
      setNotice("This career could not be saved in your browser.");
    }
  }, [career]);

  const totalCost = useMemo(() => costOf(career.sel), [career.sel]);
  const remaining = career.budget - totalCost;
  const currentRound = CALENDAR[career.roundIndex];
  const seasonComplete = career.roundIndex >= CALENDAR.length;
  const lineupComplete = Boolean(
    career.sel.d1 && career.sel.d2 && career.sel.ch && career.sel.pu && career.sel.tp && career.sel.pit,
  );
  const canRace = lineupComplete && remaining >= 0 && !seasonComplete;
  const lineupLocked = career.roundIndex > 0;
  const averageWear = (career.carWear.powerUnit + career.carWear.gearbox) / 2;
  const stats = computeStats(career.sel, currentRound?.track || "balanced", career.dev);
  const driverStandings = sortedStandings(career.standings.drivers);
  const constructorStandings = sortedStandings(career.standings.constructors);
  const userConstructorPosition = constructorStandings.findIndex((row) => row.name === career.teamName) + 1;

  const updateCareer = (patch) => {
    setCareer((current) => ({ ...current, ...patch }));
    setNotice("");
  };

  function setPick(key, value) {
    if (lineupLocked) return;
    if ((key === "d1" && value === career.sel.d2) || (key === "d2" && value === career.sel.d1)) {
      setNotice("Your two race seats need different drivers.");
      return;
    }
    updateCareer({ sel: { ...career.sel, [key]: value } });
  }

  function runRaceWeekend() {
    if (!canRace || !currentRound) return;
    const raceWeekend = weekend(career.sel, currentRound.track, career.dev, {
      teamName: career.teamName,
      setup: career.setup,
      strategy: career.strategy,
      pitPlan: career.pitPlan,
      wear: averageWear,
    });
    const userResults = raceWeekend.results.filter((result) => result.isUser);
    const teamPoints = userResults.reduce((sum, result) => sum + result.points, 0);
    const reward = sponsorReward(raceWeekend, career.sponsor);
    const devGain = Math.min(6, 1 + Math.floor(teamPoints / 10) + (raceWeekend.quali[0]?.isUser ? 1 : 0));
    const paceWear = career.strategy === "attack" ? 4 : career.strategy === "conserve" ? -2 : 0;
    const powerTrackWear = currentRound.track === "power" ? 3 : 0;
    const streetWear = currentRound.track === "street" ? 2 : 0;
    const wearAdded = {
      powerUnit: Math.max(3, 7 + paceWear + powerTrackWear),
      gearbox: Math.max(2, 5 + paceWear + streetWear),
    };
    const drivers = { ...career.standings.drivers };
    const constructors = { ...career.standings.constructors };
    raceWeekend.results.forEach((result) => {
      addStanding(drivers, result.driver, result.points);
      addStanding(constructors, result.team, result.points);
    });
    const report = {
      gp: currentRound.gp,
      track: currentRound.track,
      round: career.roundIndex + 1,
      payout: reward.total,
      targetMet: reward.targetMet,
      sponsorName: reward.deal.name,
      devGain,
      wearAdded,
      setup: career.setup,
      strategy: career.strategy,
      pitPlan: career.pitPlan,
      ...raceWeekend,
    };

    setCareer((current) => ({
      ...current,
      roundIndex: current.roundIndex + 1,
      funds: current.funds + reward.total,
      dev: { ...current.dev, points: Math.min(MAX_WALLET, current.dev.points + devGain) },
      carWear: {
        powerUnit: clamp(current.carWear.powerUnit + wearAdded.powerUnit),
        gearbox: clamp(current.carWear.gearbox + wearAdded.gearbox),
      },
      standings: { drivers, constructors },
      weekendHistory: [...current.weekendHistory, report],
      lastWeekend: report,
    }));
    setNotice(`${currentRound.gp} complete · +${reward.total} funds · +${devGain} development points`);
    window.requestAnimationFrame(() => document.getElementById("weekend-report")?.scrollIntoView({ behavior: "smooth" }));
  }

  function buyUpgrade(key) {
    const level = career.dev[key];
    const price = upgradeCost(level);
    if (price === null || career.dev.points < price) return;
    updateCareer({
      dev: { ...career.dev, [key]: level + 1, points: career.dev.points - price },
    });
  }

  function repair(part) {
    const cost = part === "powerUnit" ? 5 : 4;
    if (career.funds < cost || career.carWear[part] <= 0) return;
    updateCareer({
      funds: career.funds - cost,
      carWear: { ...career.carWear, [part]: Math.max(0, career.carWear[part] - 20) },
    });
  }

  function increaseBudget() {
    if (career.funds < 6 || career.budget >= 140) return;
    updateCareer({ funds: career.funds - 6, budget: career.budget + 1 });
  }

  function startNextSeason() {
    if (!seasonComplete) return;
    const constructors = sortedStandings(career.standings.constructors);
    const drivers = sortedStandings(career.standings.drivers);
    const teamPosition = constructors.findIndex((row) => row.name === career.teamName) + 1;
    const prizeMoney = Math.max(8, 28 - Math.max(1, teamPosition) * 2);
    setCareer((current) => ({
      ...current,
      seasonYear: current.seasonYear + 1,
      roundIndex: 0,
      funds: current.funds + prizeMoney,
      standings: { drivers: {}, constructors: {} },
      weekendHistory: [],
      lastWeekend: null,
      carWear: { powerUnit: 0, gearbox: 0 },
      history: [{
        year: current.seasonYear,
        constructorsChampion: constructors[0]?.name || "—",
        driversChampion: drivers[0]?.name || "—",
        teamPosition: teamPosition || "—",
      }, ...current.history].slice(0, 12),
    }));
    setNotice(`Season complete · ${prizeMoney} funds awarded · contracts are unlocked`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function newCareer() {
    if (!window.confirm("Start a new career? Your active career will be replaced.")) return;
    setCareer(freshCareer());
    setNotice("New career created.");
  }

  function saveToSlot(key) {
    const next = {
      ...slots,
      [key]: {
        meta: { teamName: career.teamName, seasonYear: career.seasonYear, savedAt: Date.now() },
        state: career,
      },
    };
    try {
      localStorage.setItem(SLOTS_KEY, JSON.stringify(next));
      setSlots(next);
      setNotice("Career saved.");
    } catch {
      setNotice("The career could not be saved in this browser.");
    }
  }

  function loadFromSlot(key) {
    if (!slots[key]) return;
    const snapshot = slots[key];
    setCareer(normalizeCareer({ ...snapshot.state, teamName: snapshot.state?.teamName || snapshot.meta?.teamName }));
    setNotice("Career loaded.");
  }

  function deleteSlot(key) {
    if (!slots[key] || !window.confirm("Delete this career save?")) return;
    const next = { ...slots, [key]: null };
    try {
      localStorage.setItem(SLOTS_KEY, JSON.stringify(next));
      setSlots(next);
      setNotice("Save slot deleted.");
    } catch {
      setNotice("The save slot could not be deleted.");
    }
  }

  return (
    <main className={styles.page} style={{ "--team": stats.color }}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.container}>
          <div className={styles.heroTopline}>
            <span className={styles.eyebrow}>Team principal career</span>
            <button className={styles.textButton} onClick={newCareer}>New career</button>
          </div>
          <div className={styles.heroGrid}>
            <div>
              <input
                className={styles.teamNameInput}
                aria-label="Team name"
                disabled={lineupLocked}
                maxLength={32}
                value={career.teamName}
                onChange={(event) => updateCareer({ teamName: event.target.value })}
              />
              <p className={styles.heroCopy}>
                Build the car, manage risk, and make every race weekend count.
              </p>
            </div>
            <div className={styles.heroMetrics}>
              <Metric label="Season" value={career.seasonYear} />
              <Metric label="Round" value={`${Math.min(career.roundIndex + 1, CALENDAR.length)}/${CALENDAR.length}`} />
              <Metric label="Funds" value={career.funds} suffix="M" />
              <Metric label="Team rank" value={userConstructorPosition ? `P${userConstructorPosition}` : "—"} />
            </div>
          </div>

          <div className={styles.calendar} aria-label="Season calendar">
            {CALENDAR.map((round, index) => (
              <div
                key={round.gp}
                className={`${styles.calendarRound} ${index < career.roundIndex ? styles.complete : ""} ${index === career.roundIndex ? styles.current : ""}`}
                title={round.gp}
              >
                <span>{index + 1}</span>
                <small>{round.gp.slice(0, 3).toUpperCase()}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.container}>
        {notice && <div className={styles.notice} role="status">{notice}</div>}

        <section className={styles.commandGrid}>
          <div className={styles.panel}>
            <PanelHeading kicker="Race control" title={seasonComplete ? "Season complete" : currentRound?.gp} badge={seasonComplete ? "Review" : `Round ${career.roundIndex + 1}`} />
            {seasonComplete ? (
              <div className={styles.seasonComplete}>
                <div className={styles.trophy}>01</div>
                <div>
                  <h3>Close the books on {career.seasonYear}</h3>
                  <p>Record the champions, collect prize money, and unlock your lineup for next season.</p>
                </div>
                <button className={styles.primaryButton} onClick={startNextSeason}>Start next season</button>
              </div>
            ) : (
              <>
                <div className={styles.trackBrief}>
                  <div className={styles.trackMark}>{String(career.roundIndex + 1).padStart(2, "0")}</div>
                  <div>
                    <strong>{TRACKS.find((item) => item.id === currentRound?.track)?.name}</strong>
                    <span>{currentRound?.track === "power" ? "Top speed and deployment" : currentRound?.track === "street" ? "Mechanical grip and precision" : currentRound?.track === "highDownforce" ? "Aero load and cornering" : "Complete car performance"}</span>
                  </div>
                </div>
                <DecisionGroup label="Car setup" options={SETUPS} value={career.setup} onChange={(setup) => updateCareer({ setup })} />
                <DecisionGroup label="Race approach" options={STRATEGIES} value={career.strategy} onChange={(strategy) => updateCareer({ strategy })} />
                <DecisionGroup label="Pit wall plan" options={PIT_PLANS} value={career.pitPlan} onChange={(pitPlan) => updateCareer({ pitPlan })} />
                {!canRace && (
                  <p className={styles.blocker}>{!lineupComplete ? "Complete your team before entering the weekend." : "Your lineup is over the cost cap."}</p>
                )}
                <button className={styles.raceButton} disabled={!canRace} onClick={runRaceWeekend}>
                  <span>Run {currentRound?.gp} weekend</span>
                  <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </div>

          <div className={`${styles.panel} ${styles.teamPanel}`}>
            <PanelHeading kicker="Performance centre" title={career.teamName || "Your team"} badge={`${stats.overall || 0} OVR`} />
            <div className={styles.driverPair}>
              <DriverChip id={career.sel.d1} seat="Car 1" />
              <DriverChip id={career.sel.d2} seat="Car 2" />
            </div>
            <div className={styles.statGrid}>
              <StatBar label="Pace" value={stats.pace} />
              <StatBar label="Qualifying" value={stats.quali} />
              <StatBar label="Race" value={stats.race} />
              <StatBar label="Reliability" value={stats.reliability} />
            </div>
            <div className={styles.healthSection}>
              <div className={styles.subheading}><span>Power unit wear</span><strong>{career.carWear.powerUnit}%</strong></div>
              <WearBar value={career.carWear.powerUnit} />
              <button className={styles.smallButton} disabled={!career.carWear.powerUnit || career.funds < 5} onClick={() => repair("powerUnit")}>Service · 5M</button>
              <div className={styles.subheading}><span>Gearbox wear</span><strong>{career.carWear.gearbox}%</strong></div>
              <WearBar value={career.carWear.gearbox} />
              <button className={styles.smallButton} disabled={!career.carWear.gearbox || career.funds < 4} onClick={() => repair("gearbox")}>Service · 4M</button>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <PanelHeading kicker="Sporting department" title="Build your team" badge={lineupLocked ? "Locked in-season" : `${Math.max(0, remaining)} cap left`} />
          <div className={styles.builderGrid}>
            <Field label="Driver 1">
              <select value={career.sel.d1} disabled={lineupLocked} onChange={(event) => setPick("d1", event.target.value)}>
                <option value="">Select driver</option>
                {DRIVERS.map((driver) => <option key={driver.id} value={driver.id} disabled={driver.id === career.sel.d2}>{driver.flag} {driver.name} · {driver.cost}</option>)}
              </select>
            </Field>
            <Field label="Driver 2">
              <select value={career.sel.d2} disabled={lineupLocked} onChange={(event) => setPick("d2", event.target.value)}>
                <option value="">Select driver</option>
                {DRIVERS.map((driver) => <option key={driver.id} value={driver.id} disabled={driver.id === career.sel.d1}>{driver.flag} {driver.name} · {driver.cost}</option>)}
              </select>
            </Field>
            <Field label="Chassis">
              <select value={career.sel.ch} disabled={lineupLocked} onChange={(event) => setPick("ch", event.target.value)}>
                <option value="">Select chassis</option>
                {CHASSIS.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.cost}</option>)}
              </select>
            </Field>
            <Field label="Power unit">
              <select value={career.sel.pu} disabled={lineupLocked} onChange={(event) => setPick("pu", event.target.value)}>
                <option value="">Select power unit</option>
                {ENGINES.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.cost}</option>)}
              </select>
            </Field>
            <Field label="Team principal">
              <select value={career.sel.tp} disabled={lineupLocked} onChange={(event) => setPick("tp", event.target.value)}>
                <option value="">Select principal</option>
                {PRINCIPALS.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.cost}</option>)}
              </select>
            </Field>
            <Field label="Pit crew">
              <select value={career.sel.pit} disabled={lineupLocked} onChange={(event) => setPick("pit", event.target.value)}>
                {PIT.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.cost}</option>)}
              </select>
            </Field>
          </div>
          <div className={styles.capRow}>
            <div className={styles.capCopy}>
              <span>Cost cap</span>
              <strong className={remaining < 0 ? styles.negative : ""}>{totalCost} / {career.budget}</strong>
            </div>
            <div className={styles.capTrack}><span className={remaining < 0 ? styles.overCap : ""} style={{ width: `${Math.min(100, (totalCost / career.budget) * 100)}%` }} /></div>
            <button className={styles.smallButton} disabled={career.funds < 6 || career.budget >= 140} onClick={increaseBudget}>Expand cap +1 · 6M</button>
          </div>
        </section>

        <section className={styles.splitGrid}>
          <div className={styles.panel}>
            <PanelHeading kicker="Commercial" title="Sponsor contract" badge={lineupLocked ? "Signed" : "Negotiations open"} />
            <div className={styles.sponsorList}>
              {SPONSORS.map((sponsor) => (
                <button
                  key={sponsor.id}
                  className={`${styles.sponsorCard} ${career.sponsor === sponsor.id ? styles.selectedSponsor : ""}`}
                  disabled={lineupLocked}
                  onClick={() => updateCareer({ sponsor: sponsor.id })}
                >
                  <span className={styles.sponsorTop}><strong>{sponsor.name}</strong><b>{sponsor.base}M base</b></span>
                  <span>{sponsor.objective}</span>
                  <small>Target bonus {sponsor.targetBonus}M · {sponsor.desc}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <PanelHeading kicker="R&D allocation" title="Car development" badge={`${career.dev.points}/${MAX_WALLET} points`} />
            <div className={styles.upgradeGrid}>
              <UpgradeCard name="Aerodynamics" level={career.dev.aero} points={career.dev.points} onBuy={() => buyUpgrade("aero")} />
              <UpgradeCard name="Power unit" level={career.dev.power} points={career.dev.points} onBuy={() => buyUpgrade("power")} />
              <UpgradeCard name="Mechanical" level={career.dev.mech} points={career.dev.points} onBuy={() => buyUpgrade("mech")} />
              <UpgradeCard name="Reliability" level={career.dev.rel} points={career.dev.points} onBuy={() => buyUpgrade("rel")} />
              <UpgradeCard name="Pit operations" level={career.dev.pit} points={career.dev.points} onBuy={() => buyUpgrade("pit")} />
            </div>
          </div>
        </section>

        {(driverStandings.length > 0 || constructorStandings.length > 0) && (
          <section className={styles.standingsGrid}>
            <StandingsTable title="Constructors" rows={constructorStandings} highlight={career.teamName} />
            <StandingsTable title="Drivers" rows={driverStandings.slice(0, 10)} highlight={[DRIVERS.find((d) => d.id === career.sel.d1)?.name, DRIVERS.find((d) => d.id === career.sel.d2)?.name]} />
          </section>
        )}

        {career.lastWeekend && <WeekendReport report={career.lastWeekend} />}

        <section className={styles.panel}>
          <PanelHeading kicker="Career archive" title="Save room" badge={`${career.history.length} completed seasons`} />
          <div className={styles.saveGrid}>
            {["slot1", "slot2", "slot3"].map((key, index) => {
              const snapshot = slots[key];
              return (
                <div className={styles.saveCard} key={key}>
                  <span>Career {index + 1}</span>
                  <strong>{snapshot?.meta?.teamName || "Empty slot"}</strong>
                  <small>{snapshot ? `${snapshot.meta.seasonYear} · ${new Date(snapshot.meta.savedAt).toLocaleDateString()}` : "No saved career"}</small>
                  <div>
                    <button onClick={() => saveToSlot(key)}>Save</button>
                    <button disabled={!snapshot} onClick={() => loadFromSlot(key)}>Load</button>
                    <button disabled={!snapshot} onClick={() => deleteSlot(key)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
          {career.history.length > 0 && (
            <div className={styles.historyRow}>
              {career.history.map((season) => (
                <div key={season.year}><strong>{season.year}</strong><span>Team P{season.teamPosition} · {season.driversChampion} champion</span></div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, suffix = "" }) {
  return <div className={styles.metric}><span>{label}</span><strong>{value}{suffix}</strong></div>;
}

function PanelHeading({ kicker, title, badge }) {
  return (
    <div className={styles.panelHeading}>
      <div><span>{kicker}</span><h2>{title}</h2></div>
      {badge && <b>{badge}</b>}
    </div>
  );
}

function Field({ label, children }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

function DecisionGroup({ label, options, value, onChange }) {
  return (
    <div className={styles.decisionGroup}>
      <span className={styles.decisionLabel}>{label}</span>
      <div className={styles.decisionOptions}>
        {options.map((option) => (
          <button key={option.id} className={value === option.id ? styles.activeDecision : ""} onClick={() => onChange(option.id)}>
            <strong>{option.name}</strong><small>{option.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function DriverChip({ id, seat }) {
  const driver = DRIVERS.find((item) => item.id === id);
  if (!driver) return <div className={styles.emptyDriver}><span>{seat}</span><strong>Seat available</strong></div>;
  return (
    <div className={styles.driverChip}>
      <div className={styles.avatar}>{initials(driver.name)}</div>
      <div><span>{seat} · {driver.flag}</span><strong>{driver.name}</strong><small>{driver.team} · {driver.cost} cap</small></div>
    </div>
  );
}

function StatBar({ label, value = 0 }) {
  const safeValue = clamp(value);
  return (
    <div className={styles.stat}>
      <div><span>{label}</span><strong>{safeValue}</strong></div>
      <div className={styles.statTrack}><span style={{ width: `${safeValue}%` }} /></div>
    </div>
  );
}

function WearBar({ value }) {
  const state = value >= 70 ? styles.criticalWear : value >= 40 ? styles.warningWear : "";
  return <div className={`${styles.wearTrack} ${state}`}><span style={{ width: `${value}%` }} /></div>;
}

function UpgradeCard({ name, level, points, onBuy }) {
  const price = upgradeCost(level);
  return (
    <div className={styles.upgradeCard}>
      <div><strong>{name}</strong><span>Level {level}/5</span></div>
      <div className={styles.levelTrack}>{[1, 2, 3, 4, 5].map((step) => <i key={step} className={level >= step ? styles.levelDone : ""} />)}</div>
      <button disabled={price === null || points < price} onClick={onBuy}>{price === null ? "Max level" : `Develop · ${price} pts`}</button>
    </div>
  );
}

function StandingsTable({ title, rows, highlight }) {
  const highlighted = Array.isArray(highlight) ? highlight : [highlight];
  return (
    <section className={styles.panel}>
      <PanelHeading kicker="Championship" title={title} badge={`${rows.length} classified`} />
      <ol className={styles.standingsList}>
        {rows.map((row, index) => (
          <li key={row.name} className={highlighted.includes(row.name) ? styles.userStanding : ""}>
            <b>{String(index + 1).padStart(2, "0")}</b><span>{row.name}</span><strong>{row.points} PTS</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WeekendReport({ report }) {
  return (
    <section className={styles.panel} id="weekend-report">
      <PanelHeading kicker={`Round ${report.round} report`} title={`${report.gp} Grand Prix`} badge={`${report.payout}M sponsor payout`} />
      <div className={styles.reportSummary}>
        <span>Sponsor target <strong>{report.targetMet ? "Met" : "Missed"}</strong></span>
        <span>Development <strong>+{report.devGain} pts</strong></span>
        <span>PU wear <strong>+{report.wearAdded.powerUnit}%</strong></span>
        <span>Gearbox wear <strong>+{report.wearAdded.gearbox}%</strong></span>
      </div>
      <div className={styles.resultsGrid}>
        <ResultList title="Qualifying" rows={report.quali.slice(0, 10)} qualifying />
        <ResultList title={report.safetyCar ? "Race · Safety car" : "Race · Green flag"} rows={report.results.slice(0, 10)} />
      </div>
    </section>
  );
}

function ResultList({ title, rows, qualifying = false }) {
  return (
    <div>
      <h3 className={styles.resultTitle}>{title}</h3>
      <ol className={styles.resultList}>
        {rows.map((row) => (
          <li key={`${row.team}-${row.driver}`} className={row.isUser ? styles.userResult : ""}>
            <b>P{row.pos}</b><span>{row.driver}<small>{row.isUser ? "Your team" : row.team}</small></span>
            <strong>{qualifying ? Math.round(row.score) : row.dnf ? "DNF" : row.points ? `+${row.points}` : "—"}{row.fastestLap ? " · FL" : ""}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}
