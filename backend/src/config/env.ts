import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

const port = Number(process.env.PORT) || 3000;

const nodeEnv = process.env.NODE_ENV || "development";

const jwtSecret = process.env.JWT_SECRET;

const jwtExpiresIn: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "8h";

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured");
}

if (jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters long"
  );
}

if (
  nodeEnv === "production" &&
  jwtExpiresIn === "8h"
) {
  console.warn(
    "JWT_EXPIRES_IN is using the development default of 8h in production."
  );
}

export const env = {
  port,
  nodeEnv,
  jwtSecret,
  jwtExpiresIn
};