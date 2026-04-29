/*
  Warnings:

  - Made the column `slug` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "products_slug_key";

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;
