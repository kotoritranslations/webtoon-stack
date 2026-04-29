-- AlterTable
ALTER TABLE "platform_settings" ALTER COLUMN "freeMaxFileSize" SET DEFAULT 0.5,
ALTER COLUMN "proMaxFileSize" SET DEFAULT 10,
ALTER COLUMN "proMaxStorage" SET DEFAULT 200,
ALTER COLUMN "starterMaxFileSize" SET DEFAULT 5,
ALTER COLUMN "starterMaxStorage" SET DEFAULT 100;
