const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  requireAuth,
  adminOnly,
  require2FA,
} = require("../middlewares/authMiddleware");
const rateLimit = require("express-rate-limit");

// Rate limiting
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { error: "Trop de tentatives. Réessayez dans 15 minutes." },
});

// Routes publiques
router.post("/login", loginLimit, authController.login);
router.post("/register", authController.register); // Pour les clients seulement
router.post("/logout", authController.logout);

// Routes authentifiées
router.get("/me", requireAuth, authController.getMe);

// Routes 2FA (pour SUPER_ADMIN seulement)
router.post("/verify-2fa", requireAuth, authController.verify2FA);
router.post("/resend-2fa", requireAuth, authController.resend2FA);

// Routes protégées exemples
router.get("/client-dashboard", requireAuth, (req, res) => {
  if (req.user.role !== "CLIENT") {
    return res.status(403).json({ error: "Accès réservé aux clients" });
  }
  res.json({
    message: "Dashboard client",
    user: req.user,
    parkingSpots: [], // Exemple de données
  });
});

router.get(
  "/admin-dashboard",
  requireAuth,
  adminOnly,
  require2FA,
  (req, res) => {
    res.json({
      message: "Dashboard administrateur",
      user: req.user,
      stats: {
        totalUsers: 150,
        totalParkingSpots: 500,
        occupiedSpots: 324,
      },
    });
  }
);

module.exports = router;
