import test from "node:test";
import assert from "node:assert/strict";
import DriverStanding from "../models/driverstanding.model.js";
import Race from "../models/race.model.js";
import Team from "../models/team.model.js";
import { pickFields, validId } from "../utils/modelHelpers.js";

test("standing validation rejects negative points", () => {
  const record = new DriverStanding({ position: 1, driver: "Test Driver", car: "Test", points: -1 });
  assert.ok(record.validateSync()?.errors.points);
});

test("race validation rejects an end date before its start date", () => {
  const record = new Race({
    name: "Test GP",
    startDate: new Date("2026-05-02"),
    endDate: new Date("2026-05-01"),
    circuit: "Test Circuit",
    country: "Test Country",
  });
  assert.ok(record.validateSync()?.errors.endDate);
});

test("team validation rejects unsafe color values", () => {
  const record = new Team({ team: "Test Team", color: "red; background:url(x)" });
  assert.ok(record.validateSync()?.errors.color);
});

test("request helpers whitelist fields and validate ids", () => {
  assert.deepEqual(pickFields({ name: "Race", admin: true }, ["name"]), { name: "Race" });
  assert.equal(validId("not-an-object-id"), false);
});
