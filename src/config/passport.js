const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive)
          return done(null, false, { message: "Identifiants incorrects" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
          return done(null, false, { message: "Identifiants incorrects" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
