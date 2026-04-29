/*
  Warnings:

  - You are about to drop the column `proPlanFeePercent` on the `platform_settings` table. All the data in the column will be lost.
  - You are about to drop the column `starterPlanFeePercent` on the `platform_settings` table. All the data in the column will be lost.
  - Added the required column `feePercent` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorEarning` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feePercent` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformFee` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feePercent` to the `tips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "dmUnlockCreatorEarning" DOUBLE PRECISION,
ADD COLUMN     "dmUnlockFeePercent" DOUBLE PRECISION,
ADD COLUMN     "dmUnlockPlatformFee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "platform_settings" DROP COLUMN "proPlanFeePercent",
DROP COLUMN "starterPlanFeePercent",
ADD COLUMN     "proPlanFeeDiscount" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "starterPlanFeeDiscount" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "feePercent" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "creatorEarning" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "feePercent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "platformFee" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "tips" ADD COLUMN     "feePercent" DOUBLE PRECISION NOT NULL;
