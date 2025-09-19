const ADMIN_ROLES = ["SUPER_ADMIN"]; // ← Seul SUPER_ADMIN nécessite 2FA

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Connexion requise" });
};

const clientOnly = (req, res, next) => {
  if (req.user?.role === "CLIENT") return next();
  res.status(403).json({ error: "Accès réservé aux clients" });
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === "SUPER_ADMIN") return next(); // ← Seul SUPER_ADMIN
  res.status(403).json({ error: "Accès réservé à l'administrateur" });
};

const require2FA = (req, res, next) => {
  if (req.user?.role === "SUPER_ADMIN" && !req.session.twoFactorVerified) {
    return res.status(403).json({
      error: "Vérification 2FA requise",
      requires2FA: true,
    });
  }
  next();
};

module.exports = {
  requireAuth,
  clientOnly,
  adminOnly,
  require2FA,
  ADMIN_ROLES,
};
