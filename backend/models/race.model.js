import mongoose from 'mongoose';

const raceSchema = new mongoose.Schema({
  name: String,
  startDate: String,
  endDate: String,
  circuit: String,
  country: String,
  flag: String,
  race: String 
});

export default mongoose.model('Race', raceSchema, 'races');
