const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const {
  validateLogin,
  validateRegister,
} = require("../validators/authValidator");
const { generate2FACode, send2FAEmail } = require("../utils/twoFactor");
const { ADMIN_ROLES } = require("../middlewares/authMiddleware");
const passport = require("passport");

const prisma = new PrismaClient();

// Register
const register = async (req, res) => {
  try {
    const { error, value } = validateRegister.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, role } = value;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
      select: { id: true, email: true, role: true },
    });

    res.status(201).json({ message: "Compte créé", user });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Login
const login = (req, res, next) => {
  const { error } = validateLogin.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  passport.authenticate("local", async (err, user, info) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    if (!user) return res.status(401).json({ error: info.message });

    req.logIn(user, async (err) => {
      if (err) return res.status(500).json({ error: "Erreur de session" });

      if (ADMIN_ROLES.includes(user.role)) {
        const code = generate2FACode();
        req.session.twoFactorCode = code;
        req.session.twoFactorExpiry = Date.now() + 5 * 60 * 1000;
        req.session.twoFactorVerified = false;

        try {
          await send2FAEmail(user.email, code);
          return res.json({
            message: "Code 2FA envoyé par email",
            requires2FA: true,
            user: { id: user.id, email: user.email, role: user.role },
          });
        } catch {
          return res.status(500).json({ error: "Erreur envoi code 2FA" });
        }
      }

      res.json({
        message: "Connexion réussie",
        user: { id: user.id, email: user.email, role: user.role },
      });
    });
  })(req, res, next);
};

// Verify 2FA
const verify2FA = (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Non connecté" });

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code requis" });

  const { twoFactorCode, twoFactorExpiry } = req.session;

  if (!twoFactorCode)
    return res.status(400).json({ error: "Aucun code en attente" });
  if (Date.now() > twoFactorExpiry)
    return res.status(400).json({ error: "Code expiré" });
  if (code !== twoFactorCode)
    return res.status(400).json({ error: "Code incorrect" });

  req.session.twoFactorVerified = true;
  delete req.session.twoFactorCode;
  delete req.session.twoFactorExpiry;

  res.json({
    message: "Authentification complète",
    user: { id: req.user.id, email: req.user.email, role: req.user.role },
  });
};

// Resend 2FA
const resend2FA = async (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Non connecté" });
  if (!ADMIN_ROLES.includes(req.user.role))
    return res.status(400).json({ error: "2FA non requis" });

  try {
    const code = generate2FACode();
    req.session.twoFactorCode = code;
    req.session.twoFactorExpiry = Date.now() + 5 * 60 * 1000;
    await send2FAEmail(req.user.email, code);
    res.json({ message: "Nouveau code envoyé" });
  } catch {
    res.status(500).json({ error: "Erreur renvoi code" });
  }
};

// Logout
const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Erreur déconnexion" });
    req.session.destroy(() => res.json({ message: "Déconnecté" }));
  });
};

// Get current user
const getMe = (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Non connecté" });

  res.json({
    user: { id: req.user.id, email: req.user.email, role: req.user.role },
    requires2FA: ADMIN_ROLES.includes(req.user.role),
    twoFactorVerified: req.session.twoFactorVerified || false,
  });
};

module.exports = { register, login, verify2FA, resend2FA, logout, getMe };
