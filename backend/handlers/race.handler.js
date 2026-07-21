import Race from "../models/race.model.js";
import { createCrudHandlers } from "./crud.handler.js";

const handlers = createCrudHandlers({
  Model: Race,
  fields: ["name", "startDate", "endDate", "circuit", "country", "flag", "race"],
  label: "Race",
  sort: { startDate: 1 },
});

export const getAllRaces = handlers.getAll;
export const getRaceById = handlers.getById;
export const createRace = handlers.create;
export const updateRace = handlers.update;
export const deleteRace = handlers.remove;
