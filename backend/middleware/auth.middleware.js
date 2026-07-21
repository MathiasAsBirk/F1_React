import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_TTL = "2h";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function authConfigured() {
  return Boolean(
    process.env.ADMIN_JWT_SECRET?.length >= 32 &&
    (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD),
  );
}

export async function createAdminSession(req, res) {
  if (!authConfigured()) {
    return res.status(503).json({ message: "Admin login is not configured." });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password || password.length > 200) {
    return res.status(400).json({ message: "A valid password is required." });
  }

  const valid = process.env.ADMIN_PASSWORD_HASH
    ? await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
    : safeEqual(password, process.env.ADMIN_PASSWORD);

  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ role: "admin" }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: TOKEN_TTL,
    issuer: "f1info-api",
    audience: "f1info-admin",
  });

  return res.json({ token, expiresIn: TOKEN_TTL });
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token || !process.env.ADMIN_JWT_SECRET) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET, {
      issuer: "f1info-api",
      audience: "f1info-admin",
    });
    if (payload.role !== "admin") throw new Error("Invalid role");
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Session expired or invalid." });
  }
}
