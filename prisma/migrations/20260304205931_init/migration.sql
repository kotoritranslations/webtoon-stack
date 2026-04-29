/*
  Warnings:

  - A unique constraint covering the columns `[starterSubscriptionId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "affiliateMinPayoutAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "starterMaxFileSize" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "starterMaxProducts" INTEGER,
ADD COLUMN     "starterMaxStorage" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "starterPlanEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "starterPlanFeePercent" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "starterPlanPrice" DOUBLE PRECISION NOT NULL DEFAULT 19.00,
ALTER COLUMN "platformFeePercent" SET DEFAULT 5,
ALTER COLUMN "freeMaxFileSize" SET DEFAULT 1,
ALTER COLUMN "freeMaxProducts" DROP NOT NULL,
ALTER COLUMN "freeMaxProducts" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "starterCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "starterPlanStatus" TEXT,
ADD COLUMN     "starterSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_starterSubscriptionId_key" ON "users"("starterSubscriptionId");
