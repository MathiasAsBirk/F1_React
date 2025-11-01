import express from "express";
import DriverStanding from "../models/driverStanding.model.js";
import TeamStanding from "../models/teamStanding.model.js";

const router = express.Router();

// GET /api/standings/drivers
router.get("/drivers", async (req, res) => {
  console.log("🔥 /drivers route hit");
  try {
console.log("🚨 typeof DriverStanding:", typeof DriverStanding);
console.log("🚨 model keys:", Object.keys(DriverStanding));

    const drivers = await DriverStanding.find();
    console.log("✅ DRIVERS FOUND:", drivers.length);
    res.json(drivers);
  } catch (err) {
    console.error("❌ Failed to get driver standings:", err.stack || err);
    res.status(500).json({ message: "Driver fetch failed", error: err.message });
  }
});

// GET /api/standings/teams
router.get("/teams", async (req, res) => {
  console.log("🔥 /teams route hit");
  try {
console.log("🚨 typeof TeamStanding:", typeof TeamStanding);
console.log("🚨 model keys:", Object.keys(TeamStanding));

    const teams = await TeamStanding.find();
    console.log("✅ TEAMS FOUND:", teams.length);
    res.json(teams);
  } catch (err) {
    console.error("❌ Failed to get team standings:", err.stack || err);
    res.status(500).json({ message: "Team fetch failed", error: err.message });
  }
});


export default router;
