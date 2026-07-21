import express from "express";
import { createAdminSession, requireAdmin } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/security.middleware.js";
import DriverStanding from "../models/driverstanding.model.js";
import TeamStanding from "../models/teamStanding.model.js";

const router = express.Router();
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.post(
  "/session",
  rateLimit({ windowMs: 15 * 60_000, max: 8, namespace: "admin-login" }),
  createAdminSession,
);

router.put("/standings/driver", requireAdmin, async (req, res) => {
  try {
    const driver = typeof req.body?.driver === "string" ? req.body.driver.trim() : "";
    const points = Number(req.body?.points);
    if (!driver || !Number.isFinite(points) || points < 0 || points > 10_000) {
      return res.status(400).json({ message: "A driver and points between 0 and 10,000 are required." });
    }

    const updated = await DriverStanding.findOneAndUpdate(
      { driver: { $regex: new RegExp(`^${escapeRegex(driver)}$`, "i") } },
      { $set: { points } },
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(404).json({ message: `Driver '${driver}' was not found.` });
    return res.json({ data: updated });
  } catch (error) {
    console.error("Driver standings update failed:", error.message);
    return res.status(500).json({ message: "Driver standings could not be updated." });
  }
});

router.put("/standings/team", requireAdmin, async (req, res) => {
  try {
    const team = typeof req.body?.team === "string" ? req.body.team.trim() : "";
    const points = Number(req.body?.points);
    if (!team || !Number.isFinite(points) || points < 0 || points > 10_000) {
      return res.status(400).json({ message: "A team and points between 0 and 10,000 are required." });
    }

    const updated = await TeamStanding.findOneAndUpdate(
      { team: { $regex: new RegExp(`^${escapeRegex(team)}$`, "i") } },
      { $set: { points } },
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(404).json({ message: `Team '${team}' was not found.` });
    return res.json({ data: updated });
  } catch (error) {
    console.error("Team standings update failed:", error.message);
    return res.status(500).json({ message: "Team standings could not be updated." });
  }
});

export default router;
