import express from "express";
import { simpleAuth } from "../middleware/auth.middleware.js";
import DriverStanding from "../models/driverStanding.model.js";
import TeamStanding from "../models/teamStanding.model.js";

const router = express.Router();

// Helper: escape regex
const esc = (s="") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * PUT /api/admin/standing/driver
 * body: { driver: "Norris", points: 180 }
 */
router.put("/standing/driver", simpleAuth, async (req, res) => {
  try {
    console.log("PUT /admin/standing/driver", { headers: req.headers.authorization, body: req.body });

    const { driver, points } = req.body || {};
    if (!driver || Number.isNaN(Number(points))) {
      return res.status(400).json({ message: "driver (string) and points (number) are required" });
    }

    const updated = await DriverStanding.findOneAndUpdate(
      { driver: { $regex: new RegExp(`^${esc(driver)}$`, "i") } }, // case-insensitive exact
      { $set: { points: Number(points) } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: `Driver '${driver}' not found` });
    return res.json({ ok: true, data: updated });
  } catch (err) {
    console.error("PUT /admin/standing/driver failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PUT /api/admin/standing/team
 * body: { team: "Ferrari", points: 165 }
 */
router.put("/standing/team", simpleAuth, async (req, res) => {
  try {
    console.log("PUT /admin/standing/team", { headers: req.headers.authorization, body: req.body });

    const { team, points } = req.body || {};
    if (!team || Number.isNaN(Number(points))) {
      return res.status(400).json({ message: "team (string) and points (number) are required" });
    }

    const updated = await TeamStanding.findOneAndUpdate(
      { team: { $regex: new RegExp(`^${esc(team)}$`, "i") } }, // case-insensitive exact
      { $set: { points: Number(points) } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: `Team '${team}' not found` });
    return res.json({ ok: true, data: updated });
  } catch (err) {
    console.error("PUT /admin/standing/team failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
