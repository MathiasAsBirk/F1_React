const requests = new Map();
let requestChecks = 0;

function pruneRateLimitRecords(now) {
  for (const [key, record] of requests) {
    if (record.resetAt <= now) requests.delete(key);
  }
  while (requests.size > 10_000) {
    requests.delete(requests.keys().next().value);
  }
}

export function securityHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
}

export function rateLimit({ windowMs = 60_000, max = 120, namespace = "global" } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    requestChecks += 1;
    if (requestChecks % 500 === 0 || requests.size > 10_000) pruneRateLimitRecords(now);
    const key = `${namespace}:${req.ip}`;
    const record = requests.get(key);

    if (!record || record.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", max - 1);
      return next();
    }

    record.count += 1;
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(0, max - record.count));
    if (record.count > max) {
      res.setHeader("Retry-After", Math.ceil((record.resetAt - now) / 1000));
      return res.status(429).json({ message: "Too many requests. Please try again shortly." });
    }
    return next();
  };
}
