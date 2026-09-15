
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`${signal} received. Shutting down server...`);

      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log("Database connection closed.");
          process.exit(0);
        } catch (error) {
          console.error(
            "Error while disconnecting from the database:",
            error
          );
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    await prisma.$disconnect();
    process.exit(1);
  }
};

void startServer();
