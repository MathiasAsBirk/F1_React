import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

const [{ default: app }, { default: dbConnect }] = await Promise.all([
  import("./app.js"),
  import("./dbConnect.js"),
]);

const port = Number(process.env.SERVER_PORT) || 5000;

try {
  await dbConnect();
  const server = app.listen(port, () => {
    console.log(`F1Info API listening on http://localhost:${port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received. Closing server.`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (error) {
  console.error("API startup failed:", error.message);
  process.exit(1);
}
