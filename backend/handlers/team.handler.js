import Team from "../models/team.model.js";
import { createCrudHandlers } from "./crud.handler.js";

const handlers = createCrudHandlers({
  Model: Team,
  fields: ["team", "color", "logo", "drivers"],
  label: "Team",
  sort: { team: 1 },
});

export const getAllTeams = handlers.getAll;
export const getTeamById = handlers.getById;
export const createTeam = handlers.create;
export const updateTeam = handlers.update;
export const deleteTeam = handlers.remove;
