import mongoose from "mongoose";

const teamStandingSchema = new mongoose.Schema({
  position: { type: Number, required: true, min: 1, max: 99 },
  team: { type: String, required: true, trim: true, maxlength: 80, unique: true },
  points: { type: Number, required: true, min: 0, max: 10_000, default: 0 },
}, { timestamps: true, versionKey: false });

export default mongoose.models.TeamStanding ||
  mongoose.model("TeamStanding", teamStandingSchema, "teamstandings");
