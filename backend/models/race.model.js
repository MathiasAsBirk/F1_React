import mongoose from "mongoose";

const raceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  circuit: { type: String, required: true, trim: true, maxlength: 140 },
  country: { type: String, required: true, trim: true, maxlength: 80 },
  flag: { type: String, trim: true, maxlength: 1_000, default: "" },
  race: { type: String, trim: true, maxlength: 1_000, default: "" },
}, { timestamps: true, versionKey: false });

raceSchema.path("endDate").validate(function validateEndDate(value) {
  return !this.startDate || value >= this.startDate;
}, "Race end date must be on or after its start date.");

export default mongoose.models.Race || mongoose.model("Race", raceSchema, "races");
