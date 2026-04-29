/*
  Warnings:

  - You are about to drop the column `productId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `emailAffiliateCommission` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailContentRequest` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailDmUnlocked` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailNewMessage` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailNewPurchase` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailNewSubscriber` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailNewTip` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailPayoutProcessed` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushContentRequest` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushDmUnlocked` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushNewMessage` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushNewPurchase` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushNewSubscriber` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushNewTip` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushPayoutProcessed` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailSent` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `emailSentAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `affiliateAvailable` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `affiliateCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `affiliatePending` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `affiliateReferredBy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `affiliateTotalEarnings` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `affiliateTotalWithdrawn` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `availableBalance` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `creatorPlan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `dmPrice` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isAiPersona` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `likesCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `membershipDescription` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `membershipEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `membershipPrice` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `messagesEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mpAccessToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mpAccountStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mpCountry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mpMembershipPlanId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mpOnboardingDone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mpRefreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mpTokenExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mpUserId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `paypalEmailConfirmed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `paypalMembershipPlanId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `paypalMerchantId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `paypalMerchantStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `paypalOnboardingDone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pendingBalance` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `proCurrentPeriodEnd` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `proPlanStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `proSubscriptionId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `productsCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `socialFacebook` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `starterCurrentPeriodEnd` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `starterPlanStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `starterSubscriptionId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `storageUsed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeChargesEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeOnboardingDone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripePayoutsEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscribersCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `totalEarnings` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `totalSales` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `totalWithdrawn` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `affiliate_commissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `affiliate_payouts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blocked_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payouts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `platform_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_views` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tips` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "affiliate_commissions" DROP CONSTRAINT "affiliate_commissions_affiliateId_fkey";

-- DropForeignKey
ALTER TABLE "affiliate_commissions" DROP CONSTRAINT "affiliate_commissions_referredUserId_fkey";

-- DropForeignKey
ALTER TABLE "affiliate_payouts" DROP CONSTRAINT "affiliate_payouts_userId_fkey";

-- DropForeignKey
ALTER TABLE "blocked_users" DROP CONSTRAINT "blocked_users_blockedId_fkey";

-- DropForeignKey
ALTER TABLE "blocked_users" DROP CONSTRAINT "blocked_users_userId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_productId_fkey";

-- DropForeignKey
ALTER TABLE "content_requests" DROP CONSTRAINT "content_requests_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "content_requests" DROP CONSTRAINT "content_requests_userId_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_userId_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_productId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "payouts" DROP CONSTRAINT "payouts_userId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_productId_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_userId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "tips" DROP CONSTRAINT "tips_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "tips" DROP CONSTRAINT "tips_toCreatorId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropIndex
DROP INDEX "comments_productId_idx";

-- DropIndex
DROP INDEX "follows_createdAt_idx";

-- DropIndex
DROP INDEX "likes_createdAt_idx";

-- DropIndex
DROP INDEX "likes_productId_idx";

-- DropIndex
DROP INDEX "likes_userId_productId_key";

-- DropIndex
DROP INDEX "users_affiliateCode_idx";

-- DropIndex
DROP INDEX "users_affiliateCode_key";

-- DropIndex
DROP INDEX "users_affiliateReferredBy_idx";

-- DropIndex
DROP INDEX "users_creatorPlan_idx";

-- DropIndex
DROP INDEX "users_isAiPersona_idx";

-- DropIndex
DROP INDEX "users_mpUserId_idx";

-- DropIndex
DROP INDEX "users_mpUserId_key";

-- DropIndex
DROP INDEX "users_paypalMerchantId_idx";

-- DropIndex
DROP INDEX "users_paypalMerchantId_key";

-- DropIndex
DROP INDEX "users_proSubscriptionId_key";

-- DropIndex
DROP INDEX "users_starterSubscriptionId_key";

-- DropIndex
DROP INDEX "users_stripeAccountId_idx";

-- DropIndex
DROP INDEX "users_stripeAccountId_key";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "productId",
ADD COLUMN     "chapterId" TEXT,
ADD COLUMN     "seriesId" TEXT;

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "productId",
ADD COLUMN     "chapterId" TEXT,
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "seriesId" TEXT;

-- AlterTable
ALTER TABLE "notification_preferences" DROP COLUMN "emailAffiliateCommission",
DROP COLUMN "emailContentRequest",
DROP COLUMN "emailDmUnlocked",
DROP COLUMN "emailNewMessage",
DROP COLUMN "emailNewPurchase",
DROP COLUMN "emailNewSubscriber",
DROP COLUMN "emailNewTip",
DROP COLUMN "emailPayoutProcessed",
DROP COLUMN "pushContentRequest",
DROP COLUMN "pushDmUnlocked",
DROP COLUMN "pushNewMessage",
DROP COLUMN "pushNewPurchase",
DROP COLUMN "pushNewSubscriber",
DROP COLUMN "pushNewTip",
DROP COLUMN "pushPayoutProcessed",
ADD COLUMN     "emailNewChapter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushNewChapter" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "emailSent",
DROP COLUMN "emailSentAt";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "affiliateAvailable",
DROP COLUMN "affiliateCode",
DROP COLUMN "affiliatePending",
DROP COLUMN "affiliateReferredBy",
DROP COLUMN "affiliateTotalEarnings",
DROP COLUMN "affiliateTotalWithdrawn",
DROP COLUMN "availableBalance",
DROP COLUMN "creatorPlan",
DROP COLUMN "dmPrice",
DROP COLUMN "isAiPersona",
DROP COLUMN "likesCount",
DROP COLUMN "membershipDescription",
DROP COLUMN "membershipEnabled",
DROP COLUMN "membershipPrice",
DROP COLUMN "messagesEnabled",
DROP COLUMN "mpAccessToken",
DROP COLUMN "mpAccountStatus",
DROP COLUMN "mpCountry",
DROP COLUMN "mpMembershipPlanId",
DROP COLUMN "mpOnboardingDone",
DROP COLUMN "mpRefreshToken",
DROP COLUMN "mpTokenExpiresAt",
DROP COLUMN "mpUserId",
DROP COLUMN "paypalEmailConfirmed",
DROP COLUMN "paypalMembershipPlanId",
DROP COLUMN "paypalMerchantId",
DROP COLUMN "paypalMerchantStatus",
DROP COLUMN "paypalOnboardingDone",
DROP COLUMN "pendingBalance",
DROP COLUMN "proCurrentPeriodEnd",
DROP COLUMN "proPlanStatus",
DROP COLUMN "proSubscriptionId",
DROP COLUMN "productsCount",
DROP COLUMN "socialFacebook",
DROP COLUMN "starterCurrentPeriodEnd",
DROP COLUMN "starterPlanStatus",
DROP COLUMN "starterSubscriptionId",
DROP COLUMN "storageUsed",
DROP COLUMN "stripeAccountId",
DROP COLUMN "stripeAccountStatus",
DROP COLUMN "stripeChargesEnabled",
DROP COLUMN "stripeOnboardingDone",
DROP COLUMN "stripePayoutsEnabled",
DROP COLUMN "subscribersCount",
DROP COLUMN "totalEarnings",
DROP COLUMN "totalSales",
DROP COLUMN "totalWithdrawn",
ADD COLUMN     "totalSeries" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "affiliate_commissions";

-- DropTable
DROP TABLE "affiliate_payouts";

-- DropTable
DROP TABLE "blocked_users";

-- DropTable
DROP TABLE "content_requests";

-- DropTable
DROP TABLE "conversations";

-- DropTable
DROP TABLE "messages";

-- DropTable
DROP TABLE "payouts";

-- DropTable
DROP TABLE "platform_settings";

-- DropTable
DROP TABLE "product_views";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "purchases";

-- DropTable
DROP TABLE "subscriptions";

-- DropTable
DROP TABLE "tips";

-- DropTable
DROP TABLE "transactions";

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "iconUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "synopsis" TEXT,
    "coverUrl" TEXT,
    "coverKey" TEXT,
    "bannerUrl" TEXT,
    "bannerKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "ageRating" TEXT NOT NULL DEFAULT 'all',
    "format" TEXT NOT NULL DEFAULT 'webtoon',
    "readingDir" TEXT NOT NULL DEFAULT 'ltr',
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "bookmarksCount" INTEGER NOT NULL DEFAULT 0,
    "chaptersCount" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series_genres" (
    "seriesId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "series_genres_pkey" PRIMARY KEY ("seriesId","genreId")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "number" DOUBLE PRECISION NOT NULL,
    "title" TEXT,
    "slug" TEXT NOT NULL,
    "authorNote" TEXT,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "read_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "lastPageOrder" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "read_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "listType" TEXT NOT NULL DEFAULT 'reading',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");

-- CreateIndex
CREATE INDEX "genres_slug_idx" ON "genres"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "series"("slug");

-- CreateIndex
CREATE INDEX "series_creatorId_idx" ON "series"("creatorId");

-- CreateIndex
CREATE INDEX "series_slug_idx" ON "series"("slug");

-- CreateIndex
CREATE INDEX "series_status_idx" ON "series"("status");

-- CreateIndex
CREATE INDEX "series_format_idx" ON "series"("format");

-- CreateIndex
CREATE INDEX "series_isPublished_isActive_idx" ON "series"("isPublished", "isActive");

-- CreateIndex
CREATE INDEX "series_createdAt_idx" ON "series"("createdAt");

-- CreateIndex
CREATE INDEX "series_genres_seriesId_idx" ON "series_genres"("seriesId");

-- CreateIndex
CREATE INDEX "series_genres_genreId_idx" ON "series_genres"("genreId");

-- CreateIndex
CREATE INDEX "chapters_seriesId_idx" ON "chapters"("seriesId");

-- CreateIndex
CREATE INDEX "chapters_isPublished_idx" ON "chapters"("isPublished");

-- CreateIndex
CREATE INDEX "chapters_publishedAt_idx" ON "chapters"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_seriesId_number_key" ON "chapters"("seriesId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_seriesId_slug_key" ON "chapters"("seriesId", "slug");

-- CreateIndex
CREATE INDEX "pages_chapterId_idx" ON "pages"("chapterId");

-- CreateIndex
CREATE INDEX "pages_chapterId_order_idx" ON "pages"("chapterId", "order");

-- CreateIndex
CREATE INDEX "read_history_userId_idx" ON "read_history"("userId");

-- CreateIndex
CREATE INDEX "read_history_chapterId_idx" ON "read_history"("chapterId");

-- CreateIndex
CREATE INDEX "read_history_updatedAt_idx" ON "read_history"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "read_history_userId_chapterId_key" ON "read_history"("userId", "chapterId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_idx" ON "bookmarks"("userId");

-- CreateIndex
CREATE INDEX "bookmarks_seriesId_idx" ON "bookmarks"("seriesId");

-- CreateIndex
CREATE INDEX "bookmarks_listType_idx" ON "bookmarks"("listType");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_seriesId_key" ON "bookmarks"("userId", "seriesId");

-- CreateIndex
CREATE INDEX "comments_seriesId_idx" ON "comments"("seriesId");

-- CreateIndex
CREATE INDEX "comments_chapterId_idx" ON "comments"("chapterId");

-- CreateIndex
CREATE INDEX "likes_seriesId_idx" ON "likes"("seriesId");

-- CreateIndex
CREATE INDEX "likes_chapterId_idx" ON "likes"("chapterId");

-- CreateIndex
CREATE INDEX "likes_commentId_idx" ON "likes"("commentId");

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_genres" ADD CONSTRAINT "series_genres_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series_genres" ADD CONSTRAINT "series_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_history" ADD CONSTRAINT "read_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_history" ADD CONSTRAINT "read_history_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
