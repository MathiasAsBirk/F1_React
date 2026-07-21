import mongoose from "mongoose";

const driverStandingSchema = new mongoose.Schema({
  position: { type: Number, required: true, min: 1, max: 99 },
  driver: { type: String, required: true, trim: true, maxlength: 80, unique: true },
  nationality: { type: String, trim: true, maxlength: 40, default: "" },
  car: { type: String, required: true, trim: true, maxlength: 80 },
  points: { type: Number, required: true, min: 0, max: 10_000, default: 0 },
}, { timestamps: true, versionKey: false });

export default mongoose.models.DriverStanding ||
  mongoose.model("DriverStanding", driverStandingSchema, "driverstandings");
