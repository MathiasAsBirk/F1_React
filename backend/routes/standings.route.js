import express from "express";
import DriverStanding from "../models/driverstanding.model.js";
import TeamStanding from "../models/teamStanding.model.js";

const router = express.Router();

router.get("/drivers", async (_req, res) => {
  try {
    const drivers = await DriverStanding.find().sort({ points: -1, position: 1 }).lean();
    return res.json(drivers);
  } catch (error) {
    console.error("Driver standings fetch failed:", error.message);
    return res.status(500).json({ message: "Driver standings could not be loaded." });
  }
});

router.get("/teams", async (_req, res) => {
  try {
    const teams = await TeamStanding.find().sort({ points: -1, position: 1 }).lean();
    return res.json(teams);
  } catch (error) {
    console.error("Team standings fetch failed:", error.message);
    return res.status(500).json({ message: "Team standings could not be loaded." });
  }
});

export default router;
