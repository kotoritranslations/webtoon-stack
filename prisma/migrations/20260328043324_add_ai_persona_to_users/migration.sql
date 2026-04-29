-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isAiPersona" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "users_isAiPersona_idx" ON "users"("isAiPersona");
