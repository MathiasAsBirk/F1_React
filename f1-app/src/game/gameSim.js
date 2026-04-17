/* ============================================================
   F1 Manager — simulation & stats engine
   Pure functions: no React, no state. Import into DreamTeam.jsx.
   ============================================================ */

import { DRIVERS, CHASSIS, ENGINES, PRINCIPALS, PIT, COMP, TRACKS, CALENDAR, RIVALS, FIA_PTS } from "./gameData";

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

function makeField(userSel) {
  const field = [{ team: "You", d1: userSel.d1, d2: userSel.d2, combo: userSel, isUser: true }];
  RIVALS.forEach((r) => field.push({ team: r.name, d1: r.combo.d1, d2: r.combo.d2, combo: r.combo, isUser: false }));
  return field;
}

function qualiSession(userSel, trackId, upgrades) {
  const field = makeField(userSel);
  const entries = [];
  field.forEach((entry) => {
    ["d1", "d2"].forEach((slot) => {
      const driver = DRIVERS.find((d) => d.id === entry[slot]);
      const base =
        computeStats(entry.combo, trackId, entry.isUser ? upgrades : undefined).quali * 0.6 +
        (driver?.quali || 0) * 0.4;
      entries.push({ team: entry.team, driver: driver?.name || "Unknown", isUser: entry.isUser, score: base + normalNoise(3.8) });
    });
  });
  return entries.sort((a, b) => b.score - a.score).map((x, i) => ({ pos: i + 1, ...x }));
}

function dnfChanceFor(sel, trackId, upgrades) {
  const rel  = computeStats(sel, trackId, upgrades).reliability || 80;
  const base = clamp(12 - rel / 10, 0.5, 8);
  return base / 100;
}

function raceSession(userSel, trackId, grid, upgrades) {
  const safetyCar = Math.random() < 0.27;
  const sd = safetyCar ? 3.2 : 4.0;

  const results = grid.map((row) => {
    const sel          = row.team === "You" ? userSel : RIVALS.find((r) => r.name === row.team)?.combo;
    const upgradesMaybe = row.team === "You" ? upgrades : undefined;
    const raceStat     = computeStats(sel, trackId, upgradesMaybe).race;
    const gridPenalty  = (row.pos - 1) * 0.7;
    const dnf          = Math.random() < dnfChanceFor(sel, trackId, upgradesMaybe);
    const score        = dnf ? -9999 : raceStat * 0.9 - gridPenalty + normalNoise(sd);
    return { ...row, dnf, raceScore: Math.round(score) };
  });

  const classified = [
    ...results.filter((r) => !r.dnf).sort((a, b) => b.raceScore - a.raceScore),
    ...results.filter((r) => r.dnf),
  ];

  const withPoints = classified.map((r, i) => ({
    pos: i + 1, team: r.team, driver: r.driver, isUser: r.isUser,
    dnf: r.dnf, score: r.raceScore, points: r.dnf ? 0 : (FIA_PTS[i] || 0),
  }));

  const constructors = {};
  withPoints.forEach((r) => { constructors[r.team] = (constructors[r.team] || 0) + r.points; });

  return { results: withPoints, constructors, safetyCar };
}

export function weekend(userSel, trackId, upgrades) {
  const quali = qualiSession(userSel, trackId, upgrades);
  const race  = raceSession(userSel, trackId, quali, upgrades);
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
