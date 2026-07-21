import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  age: { type: Number, min: 16, max: 80 },
  num: { type: String, trim: true, maxlength: 3, default: "" },
  country: { type: String, trim: true, maxlength: 80, default: "" },
  flag: { type: String, trim: true, maxlength: 1_000, default: "" },
  photo: { type: String, trim: true, maxlength: 1_000, default: "" },
  car: { type: String, trim: true, maxlength: 1_000, default: "" },
}, { _id: false });

const teamSchema = new mongoose.Schema({
  team: { type: String, required: true, trim: true, maxlength: 80, unique: true },
  color: {
    type: String,
    default: "#e10600",
    validate: { validator: (value) => /^#[0-9a-f]{6}$/i.test(value), message: "Invalid team color." },
  },
  logo: { type: String, trim: true, maxlength: 1_000, default: "" },
  drivers: {
    type: [driverSchema],
    validate: { validator: (drivers) => drivers.length <= 4, message: "A team can contain at most four drivers." },
    default: [],
  },
}, { timestamps: true, versionKey: false });

export default mongoose.models.Team || mongoose.model("Team", teamSchema, "teams");
