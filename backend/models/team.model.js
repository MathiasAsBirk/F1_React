import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: String,
  age: Number,
  num: String,
  country: String,
  flag: String,
  photo: String,
  car: String
});

const teamSchema = new mongoose.Schema({
  team: String,
  color: String,
  drivers: [driverSchema]
});

export default mongoose.model('Team', teamSchema);
