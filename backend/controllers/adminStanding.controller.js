import TeamStanding from "../models/teamStanding.model.js";
import DriverStanding from "../models/driverStanding.model.js";

// Update Team Points
export const updateTeamPoints = async (req, res) => {
  const { teamId, points } = req.body;
  const team = await TeamStanding.findById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  team.points = points;
  await team.save();
  res.status(200).json(team);
};

// Update Driver Points
export const updateDriverPoints = async (req, res) => {
  const { driverId, points } = req.body;
  const driver = await DriverStanding.findById(driverId);
  if (!driver) return res.status(404).json({ error: "Driver not found" });

  driver.points = points;
  await driver.save();
  res.status(200).json(driver);
};
