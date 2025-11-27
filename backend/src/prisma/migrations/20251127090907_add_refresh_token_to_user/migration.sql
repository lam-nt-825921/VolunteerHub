-- AlterTable
ALTER TABLE "users" ADD COLUMN "refreshToken" TEXT;
ALTER TABLE "users" ADD COLUMN "refreshTokenExpiresAt" DATETIME;
