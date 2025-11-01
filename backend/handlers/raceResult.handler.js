import RaceResult from '../models/raceResult.model.js';

export const getAllRaceResults = async (req, res) => {
  try {
    const results = await RaceResult.find().sort({ date: 1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRaceResultById = async (req, res) => {
  try {
    const result = await RaceResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRaceResult = async (req, res) => {
  try {
    const result = await RaceResult.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateRaceResult = async (req, res) => {
  try {
    const updated = await RaceResult.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteRaceResult = async (req, res) => {
  try {
    const deleted = await RaceResult.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
