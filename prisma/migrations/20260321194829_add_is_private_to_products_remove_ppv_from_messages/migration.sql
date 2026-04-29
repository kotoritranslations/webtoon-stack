/*
  Warnings:

  - You are about to drop the column `messageId` on the `content_requests` table. All the data in the column will be lost.
  - You are about to drop the column `isUnlocked` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `mpPaymentId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `paypalOrderId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `ppvBlurUrl` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `ppvFileKey` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `ppvFileName` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `ppvFileUrl` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `ppvMimeType` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `ppvPrice` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `emailPpvUnlocked` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushPpvUnlocked` on the `notification_preferences` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dmUnlockStripePaymentIntent]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dmUnlockPaypalOrderId]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dmUnlockMpPaymentId]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "messages_isUnlocked_idx";

-- DropIndex
DROP INDEX "messages_mpPaymentId_key";

-- DropIndex
DROP INDEX "messages_paypalOrderId_key";

-- DropIndex
DROP INDEX "messages_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "content_requests" DROP COLUMN "messageId",
ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "dmUnlockAmount" DOUBLE PRECISION,
ADD COLUMN     "dmUnlockMpPaymentId" TEXT,
ADD COLUMN     "dmUnlockPaypalOrderId" TEXT,
ADD COLUMN     "dmUnlockProvider" TEXT,
ADD COLUMN     "dmUnlockStripePaymentIntent" TEXT;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "isUnlocked",
DROP COLUMN "mpPaymentId",
DROP COLUMN "paypalOrderId",
DROP COLUMN "ppvBlurUrl",
DROP COLUMN "ppvFileKey",
DROP COLUMN "ppvFileName",
DROP COLUMN "ppvFileUrl",
DROP COLUMN "ppvMimeType",
DROP COLUMN "ppvPrice",
DROP COLUMN "stripePaymentIntentId";

-- AlterTable
ALTER TABLE "notification_preferences" DROP COLUMN "emailPpvUnlocked",
DROP COLUMN "pushPpvUnlocked",
ADD COLUMN     "emailDmUnlocked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushDmUnlocked" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "conversations_dmUnlockStripePaymentIntent_key" ON "conversations"("dmUnlockStripePaymentIntent");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_dmUnlockPaypalOrderId_key" ON "conversations"("dmUnlockPaypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_dmUnlockMpPaymentId_key" ON "conversations"("dmUnlockMpPaymentId");

-- CreateIndex
CREATE INDEX "products_isPrivate_idx" ON "products"("isPrivate");
