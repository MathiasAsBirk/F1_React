import mongoose from "mongoose";

export function pickFields(source, allowed) {
  return allowed.reduce((result, key) => {
    if (Object.hasOwn(source || {}, key)) result[key] = source[key];
    return result;
  }, {});
}

export function validId(id) {
  return mongoose.isValidObjectId(id);
}

export function sendModelError(res, error, fallback = "Request could not be completed.") {
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ message: "The supplied data is invalid." });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: "A record with that identifier already exists." });
  }
  console.error(fallback, error?.message || error);
  return res.status(500).json({ message: fallback });
}
