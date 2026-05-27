const adminOnly = (req, res, next) => {
  // ✅ FIX — Guard if protect middleware wasn't used before this
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    req.user?.role === "admin" ||
    (adminEmail && req.user?.email === adminEmail);

  if (isAdmin) {
    return next();
  }

  return res.status(403).json({ message: "Admin access required" });
};

module.exports = { adminOnly };
