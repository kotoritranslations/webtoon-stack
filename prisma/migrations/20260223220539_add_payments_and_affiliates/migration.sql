/*
  Warnings:

  - You are about to drop the column `paypalEmail` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripePayoutId]` on the table `payouts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mpPayoutId]` on the table `payouts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mpPaymentId]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mpSubscriptionId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeAccountId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paypalMerchantId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mpUserId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[affiliateCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `payouts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "subscriptions_paypalSubscriptionId_idx";

-- AlterTable
ALTER TABLE "payouts" ADD COLUMN     "mpAccountAlias" TEXT,
ADD COLUMN     "mpPayoutId" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "stripeBankAccount" TEXT,
ADD COLUMN     "stripePayoutId" TEXT,
ALTER COLUMN "paypalEmail" DROP NOT NULL;

-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "affiliateCommissionPercent" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "affiliateDiscountPercent" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "affiliateEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "affiliateHoldDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "mpClientId" TEXT,
ADD COLUMN     "mpClientSecret" TEXT,
ADD COLUMN     "mpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mpMode" TEXT NOT NULL DEFAULT 'sandbox',
ADD COLUMN     "mpWebhookSecret" TEXT,
ADD COLUMN     "paypalWebhookId" TEXT,
ADD COLUMN     "stripeEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "stripeMode" TEXT NOT NULL DEFAULT 'test',
ADD COLUMN     "stripePublishableKey" TEXT,
ADD COLUMN     "stripeSecretKey" TEXT,
ADD COLUMN     "stripeWebhookSecret" TEXT;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "mpOrderId" TEXT,
ADD COLUMN     "mpPaymentId" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'stripe',
ADD COLUMN     "stripeChargeId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "mpPlanId" TEXT,
ADD COLUMN     "mpSubscriptionId" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'stripe',
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "provider" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "paypalEmail",
ADD COLUMN     "affiliateAvailable" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "affiliateCode" TEXT,
ADD COLUMN     "affiliatePending" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "affiliateReferredBy" TEXT,
ADD COLUMN     "affiliateTotalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "affiliateTotalWithdrawn" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "mpAccessToken" TEXT,
ADD COLUMN     "mpAccountStatus" TEXT,
ADD COLUMN     "mpCountry" TEXT,
ADD COLUMN     "mpOnboardingDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mpRefreshToken" TEXT,
ADD COLUMN     "mpTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "mpUserId" TEXT,
ADD COLUMN     "paypalEmailConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paypalMerchantId" TEXT,
ADD COLUMN     "paypalMerchantStatus" TEXT,
ADD COLUMN     "paypalOnboardingDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeAccountStatus" TEXT,
ADD COLUMN     "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeOnboardingDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "affiliate_commissions" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'pro_subscription',
    "amount" DOUBLE PRECISION NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "discountApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingMonth" INTEGER NOT NULL DEFAULT 1,
    "relatedSubscriptionId" TEXT,
    "holdUntil" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_payouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL,
    "stripePayoutId" TEXT,
    "paypalPayoutId" TEXT,
    "paypalEmail" TEXT,
    "mpPayoutId" TEXT,
    "mpAccountAlias" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "affiliate_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "affiliate_commissions_affiliateId_idx" ON "affiliate_commissions"("affiliateId");

-- CreateIndex
CREATE INDEX "affiliate_commissions_referredUserId_idx" ON "affiliate_commissions"("referredUserId");

-- CreateIndex
CREATE INDEX "affiliate_commissions_status_idx" ON "affiliate_commissions"("status");

-- CreateIndex
CREATE INDEX "affiliate_commissions_holdUntil_idx" ON "affiliate_commissions"("holdUntil");

-- CreateIndex
CREATE INDEX "affiliate_commissions_billingMonth_idx" ON "affiliate_commissions"("billingMonth");

-- CreateIndex
CREATE INDEX "affiliate_commissions_createdAt_idx" ON "affiliate_commissions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_payouts_stripePayoutId_key" ON "affiliate_payouts"("stripePayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_payouts_paypalPayoutId_key" ON "affiliate_payouts"("paypalPayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_payouts_mpPayoutId_key" ON "affiliate_payouts"("mpPayoutId");

-- CreateIndex
CREATE INDEX "affiliate_payouts_userId_idx" ON "affiliate_payouts"("userId");

-- CreateIndex
CREATE INDEX "affiliate_payouts_status_idx" ON "affiliate_payouts"("status");

-- CreateIndex
CREATE INDEX "affiliate_payouts_createdAt_idx" ON "affiliate_payouts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_stripePayoutId_key" ON "payouts"("stripePayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_mpPayoutId_key" ON "payouts"("mpPayoutId");

-- CreateIndex
CREATE INDEX "payouts_provider_idx" ON "payouts"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_stripePaymentIntentId_key" ON "purchases"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_mpPaymentId_key" ON "purchases"("mpPaymentId");

-- CreateIndex
CREATE INDEX "purchases_provider_idx" ON "purchases"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_mpSubscriptionId_key" ON "subscriptions"("mpSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_provider_idx" ON "subscriptions"("provider");

-- CreateIndex
CREATE INDEX "transactions_provider_idx" ON "transactions"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeAccountId_key" ON "users"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "users_paypalMerchantId_key" ON "users"("paypalMerchantId");

-- CreateIndex
CREATE UNIQUE INDEX "users_mpUserId_key" ON "users"("mpUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_affiliateCode_key" ON "users"("affiliateCode");

-- CreateIndex
CREATE INDEX "users_affiliateCode_idx" ON "users"("affiliateCode");

-- CreateIndex
CREATE INDEX "users_affiliateReferredBy_idx" ON "users"("affiliateReferredBy");

-- CreateIndex
CREATE INDEX "users_stripeAccountId_idx" ON "users"("stripeAccountId");

-- CreateIndex
CREATE INDEX "users_paypalMerchantId_idx" ON "users"("paypalMerchantId");

-- CreateIndex
CREATE INDEX "users_mpUserId_idx" ON "users"("mpUserId");

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
