require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const superAdminEmail = "admin@smartparking.dz";
    const superAdminPassword = "SuperAdmin123!";

    // Vérifier si le super admin existe déjà
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (existingSuperAdmin) {
      console.log("✅ Super Admin déjà créé");
      return;
    }

    // Créer le super admin
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    console.log("🎉 Super Admin créé avec succès !");
    console.log("📧 Email:", superAdminEmail);
    console.log("🔐 Mot de passe:", superAdminPassword);
    console.log("⚠️  CHANGEZ LE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION !");
  } catch (error) {
    console.error("❌ Erreur création Super Admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
