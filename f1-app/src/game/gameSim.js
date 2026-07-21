/* ============================================================
   F1 Manager — simulation & stats engine
   Pure functions: no React, no state. Import into DreamTeam.jsx.
   ============================================================ */

import { DRIVERS, CHASSIS, ENGINES, PRINCIPALS, PIT, COMP, TRACKS, CALENDAR, RIVALS, FIA_PTS } from "./gameData.js";

/* ---------- Shared helpers ---------- */

export const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));

export const initials = (name) =>
  name.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2);

/* ---------- Cost ---------- */

export function costOf(sel) {
  const getCost = (list, id) => list.find((x) => x.id === id)?.cost || 0;
  return (
    getCost(DRIVERS, sel.d1) +
    getCost(DRIVERS, sel.d2) +
    getCost(CHASSIS, sel.ch) +
    getCost(ENGINES, sel.pu) +
    getCost(PRINCIPALS, sel.tp) +
    getCost(PIT, sel.pit)
  );
}

/* ---------- Chemistry ---------- */

function chemistryBonus(d1, d2) {
  let b = 0;
  if (d1.team === d2.team) b += 1.5;
  if (d1.quali >= 95 && d2.race >= 95) b += 1;
  if (Math.abs(d1.consistency - d2.consistency) <= 2) b += 0.5;
  return b;
}

/* ---------- Stats ---------- */

export function computeStats(sel, trackId = "balanced", upgrades) {
  if (!sel.d1 || !sel.d2 || !sel.ch || !sel.pu || !sel.tp || !sel.pit)
    return { overall: 0, pace: 0, quali: 0, race: 0, reliability: 0, color: "#e10600", strat: 80 };

  const d1  = DRIVERS.find((d) => d.id === sel.d1);
  const d2  = DRIVERS.find((d) => d.id === sel.d2);
  const ch  = CHASSIS.find((c) => c.id === sel.ch);
  const pu  = ENGINES.find((e) => e.id === sel.pu);
  const tp  = PRINCIPALS.find((p) => p.id === sel.tp);
  const pit = PIT.find((p) => p.id === sel.pit);
  const w   = TRACKS.find((t) => t.id === trackId)?.w || TRACKS[0].w;

  const u = upgrades || { aero: 0, power: 0, mech: 0, rel: 0, pit: 0 };

  const aero    = ch.aero       + u.aero  * 1.5;
  const mech    = ch.mechGrip   + u.mech  * 1.5;
  const tire    = ch.tireDeg    + u.mech  * 0.6;
  const weight  = Math.max(80, ch.weight - u.mech * 0.8);
  const puPow   = pu.power      + u.power * 1.4;
  const puRel   = pu.reliability + u.rel  * 1.6;
  const pitStop = (pit?.stopSkill  ?? 80) + u.pit * 1.8;
  const pitRel  = (pit?.reliability ?? 82) + u.pit * 1.0;
  const tpStrategy = tp?.strategy ?? 80;

  const dPace  = (d1.pace  + d2.pace)  / 2;
  const dQuali = (d1.quali + d2.quali) / 2;
  const dRace  = (d1.race  + d2.race)  / 2;
  const dCons  = (d1.consistency + d2.consistency) / 2;

  const carGrip = aero * w.aero + mech * w.mech + tire * w.tire + (100 - weight) * 0.10;
  const power   = puPow * w.power + pu.efficiency * 0.15;
  const reli    = puRel * 0.5 + dCons * 0.2 + pitRel * 0.15 + (tp?.risk ?? 75) * 0.15;
  const comp    = COMP[sel.ch]?.[sel.pu] ?? 0;
  const chem    = chemistryBonus(d1, d2);

  const pace    = clamp(dPace  * 0.55 + carGrip * 0.25 + power * 0.20 + comp * 1.2);
  const quali   = clamp(dQuali * 0.65 + carGrip * 0.25 + power * 0.10 + comp * 0.8);
  const race    = clamp(dRace  * 0.45 + carGrip * 0.25 + power * 0.15 + reli  * 0.15 + comp * 1.0);
  const reliSc  = clamp(reli + chem * 2);
  const overall = Math.round(pace * 0.35 + quali * 0.20 + race * 0.30 + reliSc * 0.15 + chem * 1.2);

  return {
    overall,
    pace:        Math.round(pace),
    quali:       Math.round(quali),
    race:        Math.round(race),
    reliability: Math.round(reliSc),
    color:       CHASSIS.find((c) => c.id === sel.ch)?.color || "#e10600",
    strat:       tpStrategy,
    pit:         Math.round(clamp(pitStop)),
  };
}

/* ---------- Noise ---------- */

function normalNoise(sd = 3) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sd;
}

/* ---------- Simulation ---------- */

function makeField(userSel, teamName = "Your Team") {
  const claimed = new Set([userSel.d1, userSel.d2]);
  const available = DRIVERS
    .filter((driver) => !claimed.has(driver.id))
    .sort((a, b) => b.pace - a.pace);

  const takeDriver = (preferred) => {
    const preferredIndex = available.findIndex((driver) => driver.id === preferred);
    const index = preferredIndex >= 0 ? preferredIndex : 0;
    return available.splice(index, 1)[0]?.id;
  };

  const field = [{ team: teamName, d1: userSel.d1, d2: userSel.d2, combo: userSel, isUser: true }];
  RIVALS.forEach((r) => {
    const d1 = takeDriver(r.combo.d1);
    const d2 = takeDriver(r.combo.d2);
    field.push({
      team: r.name,
      d1,
      d2,
      combo: { ...r.combo, d1, d2 },
      isUser: false,
    });
  });
  return field;
}

function setupBonus(setup, trackId) {
  if (setup === "balanced") return 0.5;
  if (setup === "downforce") {
    if (trackId === "highDownforce") return 2.2;
    if (trackId === "street") return 1.1;
    if (trackId === "power") return -1.4;
  }
  if (setup === "speed") {
    if (trackId === "power") return 2.2;
    if (trackId === "highDownforce") return -1.2;
    return 0.4;
  }
  return 0;
}

function qualiSession(userSel, trackId, upgrades, options) {
  const field = makeField(userSel, options.teamName);
  const entries = [];
  field.forEach((entry) => {
    ["d1", "d2"].forEach((slot) => {
      const driver = DRIVERS.find((d) => d.id === entry[slot]);
      const base =
        computeStats(entry.combo, trackId, entry.isUser ? upgrades : undefined).quali * 0.6 +
        (driver?.quali || 0) * 0.4;
      const preparation = entry.isUser ? setupBonus(options.setup, trackId) : 0;
      entries.push({ team: entry.team, driver: driver?.name || "Unknown", combo: entry.combo, isUser: entry.isUser, score: base + preparation + normalNoise(3.8) });
    });
  });
  return entries.sort((a, b) => b.score - a.score).map((x, i) => ({ pos: i + 1, ...x }));
}

function dnfChanceFor(sel, trackId, upgrades, wear = 0, strategy = "balanced") {
  const rel  = computeStats(sel, trackId, upgrades).reliability || 80;
  const base = clamp(12 - rel / 10, 0.5, 8);
  const wearRisk = Math.max(0, wear - 25) * 0.075;
  const strategyRisk = strategy === "attack" ? 2.2 : strategy === "conserve" ? -1.5 : 0;
  return clamp(base + wearRisk + strategyRisk, 0.4, 25) / 100;
}

function raceSession(userSel, trackId, grid, upgrades, options) {
  const safetyCar = Math.random() < 0.27;
  const sd = safetyCar ? 3.2 : 4.0;

  const results = grid.map((row) => {
    const sel          = row.isUser ? userSel : row.combo;
    const upgradesMaybe = row.isUser ? upgrades : undefined;
    const teamStats    = computeStats(sel, trackId, upgradesMaybe);
    const raceStat     = teamStats.race;
    const gridPenalty  = (row.pos - 1) * 0.7;
    const isUser       = row.isUser;
    const strategy     = isUser ? options.strategy : "balanced";
    const wear         = isUser ? (options.wear || 0) : 12;
    const strategyPace = strategy === "attack" ? 1.8 : strategy === "conserve" ? -1.1 : 0;
    const setupPace    = isUser ? setupBonus(options.setup, trackId) : 0;
    const pitPlanBonus = isUser && options.pitPlan === "flexible" && safetyCar ? 1.5
      : isUser && options.pitPlan === "twoStop" && trackId === "highDownforce" ? 1.1
      : isUser && options.pitPlan === "oneStop" && strategy === "conserve" ? 0.8
      : 0;
    const management   = isUser ? (teamStats.strat - 80) * 0.035 + (teamStats.pit - 80) * 0.025 : 0;
    const dnf          = Math.random() < dnfChanceFor(sel, trackId, upgradesMaybe, wear, strategy);
    const score        = dnf ? -9999 : raceStat * 0.9 - gridPenalty + strategyPace + setupPace + pitPlanBonus + management + normalNoise(sd);
    return { ...row, dnf, raceScore: Math.round(score) };
  });

  const classified = [
    ...results.filter((r) => !r.dnf).sort((a, b) => b.raceScore - a.raceScore),
    ...results.filter((r) => r.dnf),
  ];

  let withPoints = classified.map((r, i) => ({
    pos: i + 1, team: r.team, driver: r.driver, isUser: r.isUser,
    dnf: r.dnf, score: r.raceScore, points: r.dnf ? 0 : (FIA_PTS[i] || 0),
  }));

  const fastest = withPoints
    .filter((result) => !result.dnf)
    .map((result) => ({ ...result, lapScore: result.score + normalNoise(2.5) }))
    .sort((a, b) => b.lapScore - a.lapScore)[0];
  withPoints = withPoints.map((result) => ({
    ...result,
    fastestLap: result.driver === fastest?.driver && result.team === fastest?.team,
    combo: undefined,
  }));

  const constructors = {};
  withPoints.forEach((r) => { constructors[r.team] = (constructors[r.team] || 0) + r.points; });

  return { results: withPoints, constructors, safetyCar };
}

export function weekend(userSel, trackId, upgrades, options = {}) {
  const prepared = {
    teamName: options.teamName || "Your Team",
    setup: options.setup || "balanced",
    strategy: options.strategy || "balanced",
    pitPlan: options.pitPlan || "flexible",
    wear: options.wear || 0,
  };
  const quali = qualiSession(userSel, trackId, upgrades, prepared);
  const race  = raceSession(userSel, trackId, quali, upgrades, prepared);
  return { quali, ...race };
}

export function autoSeason(userSel, upgrades) {
  const perRace      = [];
  const driverTable  = {};
  const consTable    = {};

  CALENDAR.forEach((round) => {
    const wk = weekend(userSel, round.track, upgrades);
    perRace.push({ gp: round.gp, track: round.track, ...wk });
    wk.results.forEach((r) => {
      driverTable[r.driver] = (driverTable[r.driver] || 0) + r.points;
      consTable[r.team]     = (consTable[r.team]     || 0) + r.points;
    });
  });

  const drivers = Object.entries(driverTable).map(([name, pts]) => ({ name, pts })).sort((a, b) => b.pts - a.pts);
  const cons    = Object.entries(consTable).map(([team, pts]) => ({ team, pts })).sort((a, b) => b.pts - a.pts);
  return { perRace, drivers, cons };
}
