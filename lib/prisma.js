/**
 * Prisma Client initialization (singleton for serverless/Next.js API routes)
 *
 * Purpose
 * - Provides a single shared PrismaClient instance across hot reloads to avoid
 *   exhausting database connections when running in development or serverless
 *   environments.
 *
 * Usage
 * - Import { prisma } from "lib/prisma" in API route handlers and services.
 * - Do not call new PrismaClient() in other modules.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
