-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "posts_eventId_createdAt_idx";

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "posts_eventId_status_createdAt_idx" ON "posts"("eventId", "status", "createdAt");
