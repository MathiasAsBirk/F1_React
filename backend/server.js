import express from "express";
import cors from "cors";
import dbConnect from "./dbConnect.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Only import your F1 route!
import teamRoutes from "./routes/team.route.js";
import raceRoutes from './routes/race.route.js';
import driverStandingRoutes from './routes/driverStanding.route.js';
import teamStandingRoutes from './routes/teamStanding.route.js';
import raceResultRoutes from './routes/raceResult.route.js';
import standingsRoutes from "./routes/standings.route.js";
import adminRoutes from "./routes/adminStanding.route.js";
// Indlæs miljøvariabler
dotenv.config({ path: `.env.local`, override: true });

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// F1 Teams route
app.use("/api/teams", teamRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/driverstandings', driverStandingRoutes);
app.use('/api/teamstandings', teamStandingRoutes);
app.use('/api/raceresults', raceResultRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/standings", standingsRoutes);
// Root route
app.get("/", (req, res) => {
  res.send("🏁 F1 API er live!");
});

// Start server & connect DB
dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveren kører på http://localhost:${PORT}`);
  });
});
