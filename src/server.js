require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const authRoutes = require("./routes/auth");

// Configuration Passport
require("./config/passport");

const app = express();

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "SECRET_TOKEN_FOR_SMART_PARKING_DZ",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Home route test
app.get("/", (req, res) => {
  res.send("🚀 Server running...");
});

// Route santé
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur sur le port ${PORT}`);
});

module.exports = app;
