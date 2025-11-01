export const simpleAuth = (req, res, next) => {
  const token = req.headers.authorization;
  const valid = process.env.ADMIN_TOKEN || "secret123";

  if (!token || token !== `Bearer ${valid}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};
