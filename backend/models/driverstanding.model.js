import mongoose from "mongoose";

const driverStandingSchema = new mongoose.Schema({
  position: Number,
  driver: String,
  nationality: String,
  car: String,
  points: Number
});

export default mongoose.models?.DriverStanding || mongoose.model("DriverStanding", driverStandingSchema, "driverstandings");
