import Race from '../models/race.model.js';

export const getAllRaces = async (req, res) => {
  try {
    const races = await Race.find();
    res.json(races);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRaceById = async (req, res) => {
  try {
    const race = await Race.findById(req.params.id);
    if (!race) return res.status(404).json({ message: "Race not found" });
    res.json(race);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRace = async (req, res) => {
  try {
    const newRace = await Race.create(req.body);
    res.status(201).json(newRace);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateRace = async (req, res) => {
  try {
    const updatedRace = await Race.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRace) return res.status(404).json({ message: "Race not found" });
    res.json(updatedRace);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteRace = async (req, res) => {
  try {
    const deleted = await Race.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Race not found" });
    res.json({ message: "Race deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
