/*
  Warnings:

  - You are about to drop the column `accentColor` on the `platform_settings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `platform_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "platform_settings" DROP COLUMN "accentColor",
DROP COLUMN "primaryColor",
ALTER COLUMN "platformName" SET DEFAULT 'Kisfer',
ALTER COLUMN "starterMaxFileSize" SET DEFAULT 2;
