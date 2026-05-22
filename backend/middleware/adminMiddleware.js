const adminOnly = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    req.user?.role === "admin" ||
    (adminEmail && req.user?.email === adminEmail);

  if (isAdmin) {
    return next();
  }

  res.status(403).json({ message: "Admin access required" });
};

module.exports = { adminOnly };
