/*
  Warnings:

  - You are about to drop the column `category` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `previewKey` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `products` table. All the data in the column will be lost.
  - Added the required column `contentType` to the `products` table without a default value. This is not possible if the table is not empty.
  - Made the column `thumbnailKey` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thumbnailUrl` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "products_category_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "category",
DROP COLUMN "duration",
DROP COLUMN "fileType",
DROP COLUMN "previewKey",
DROP COLUMN "previewUrl",
DROP COLUMN "tags",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "fileExtension" TEXT,
ALTER COLUMN "fileKey" DROP NOT NULL,
ALTER COLUMN "fileUrl" DROP NOT NULL,
ALTER COLUMN "fileMimeType" DROP NOT NULL,
ALTER COLUMN "fileSize" DROP NOT NULL,
ALTER COLUMN "fileName" DROP NOT NULL,
ALTER COLUMN "thumbnailKey" SET NOT NULL,
ALTER COLUMN "thumbnailUrl" SET NOT NULL;

-- CreateIndex
CREATE INDEX "products_contentType_idx" ON "products"("contentType");
