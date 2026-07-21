import mongoose from "mongoose";

const shortText = { type: String, trim: true, maxlength: 100, default: "" };
const raceResultSchema = new mongoose.Schema({
  grandPrix: { type: String, required: true, trim: true, maxlength: 120, unique: true },
  date: { type: Date, required: true },
  winner: { type: String, required: true, trim: true, maxlength: 80 },
  car: { type: String, required: true, trim: true, maxlength: 80 },
  laps: { type: Number, required: true, min: 1, max: 200 },
  time: shortText,
  p2: shortText,
  p2time: shortText,
  p3: shortText,
  p3time: shortText,
}, { timestamps: true, versionKey: false });

export default mongoose.models.RaceResult ||
  mongoose.model("RaceResult", raceResultSchema, "raceresults");
