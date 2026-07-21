import test from "node:test";
import assert from "node:assert/strict";
import { computeStats, costOf, weekend } from "../src/game/gameSim.js";

const selection = {
  d1: "verstappen",
  d2: "norris",
  ch: "redbull",
  pu: "hondaPU",
  tp: "horner",
  pit: "gold",
};
const development = { points: 0, aero: 1, power: 1, mech: 1, rel: 1, pit: 1 };

test("manager selection has a finite cost and performance profile", () => {
  assert.equal(costOf(selection), 123);
  const stats = computeStats(selection, "balanced", development);
  assert.ok(stats.overall > 0 && stats.overall <= 100);
  assert.ok(stats.pit > 0 && stats.pit <= 100);
});

test("race weekends contain one unique 20-driver field", () => {
  const result = weekend(selection, "power", development, {
    teamName: "Vanguard Racing",
    setup: "speed",
    strategy: "balanced",
    pitPlan: "flexible",
    wear: 20,
  });
  const names = result.results.map((row) => row.driver);
  assert.equal(names.length, 20);
  assert.equal(new Set(names).size, 20);
  assert.equal(result.results.filter((row) => row.isUser).length, 2);
  assert.equal(result.results.filter((row) => row.fastestLap).length, 1);
});
