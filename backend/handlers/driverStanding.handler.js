import DriverStanding from '../models/driverstanding.model.js';


export const getAllDriverStandings = async (req, res) => {
  try {
    const standings = await DriverStanding.find().sort({ position: 1 });
    res.json(standings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getDriverStandingById = async (req, res) => {
  try {
    const standing = await DriverStanding.findById(req.params.id);
    if (!standing) return res.status(404).json({ message: "Not found" });
    res.json(standing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const createDriverStanding = async (req, res) => {
  try {
    const standing = await DriverStanding.create(req.body);
    res.status(201).json(standing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const updateDriverStanding = async (req, res) => {
  try {
    const updated = await DriverStanding.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const deleteDriverStanding = async (req, res) => {
  try {
    const deleted = await DriverStanding.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
