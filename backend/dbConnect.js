import mongoose from "mongoose";

let cached = globalThis.__f1Mongoose;
if (!cached) {
  cached = globalThis.__f1Mongoose = { connection: null, promise: null };
}

export default async function dbConnect() {
  if (cached.connection) return cached.connection;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cached.connection = await cached.promise;
    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
    return cached.connection;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
