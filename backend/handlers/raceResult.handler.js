import RaceResult from "../models/raceResult.model.js";
import { createCrudHandlers } from "./crud.handler.js";

const handlers = createCrudHandlers({
  Model: RaceResult,
  fields: ["grandPrix", "date", "winner", "car", "laps", "time", "p2", "p2time", "p3", "p3time"],
  label: "Race result",
  sort: { date: 1 },
});

export const getAllRaceResults = handlers.getAll;
export const getRaceResultById = handlers.getById;
export const createRaceResult = handlers.create;
export const updateRaceResult = handlers.update;
export const deleteRaceResult = handlers.remove;
