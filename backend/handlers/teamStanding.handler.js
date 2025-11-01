import TeamStanding from '../models/teamStanding.model.js';

export const getAllTeamStandings = async (req, res) => {
  try {
    const standings = await TeamStanding.find().sort({ position: 1 });
    res.json(standings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeamStandingById = async (req, res) => {
  try {
    const standing = await TeamStanding.findById(req.params.id);
    if (!standing) return res.status(404).json({ message: "Not found" });
    res.json(standing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTeamStanding = async (req, res) => {
  try {
    const standing = await TeamStanding.create(req.body);
    res.status(201).json(standing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTeamStanding = async (req, res) => {
  try {
    const updated = await TeamStanding.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTeamStanding = async (req, res) => {
  try {
    const deleted = await TeamStanding.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
