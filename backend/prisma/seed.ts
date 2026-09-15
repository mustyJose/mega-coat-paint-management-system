import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;
const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

if (!seedAdminPassword) {
  throw new Error("SEED_ADMIN_PASSWORD is not configured");
}

if (seedAdminPassword.length < 8) {
  throw new Error(
    "SEED_ADMIN_PASSWORD must be at least 8 characters long"
  );
}

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl
});

const prisma = new PrismaClient({
  adapter
});

const seed = async (): Promise<void> => {
  const passwordHash = await bcrypt.hash(seedAdminPassword, 12);

  await prisma.user.upsert({
    where: {
      username: "admin"
    },
    update: {},
    create: {
      firstName: "System",
      lastName: "Administrator",
      username: "admin",
      passwordHash,
      role: "ADMIN"
    }
  });

  console.log("Initial admin account created.");
};

seed()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });