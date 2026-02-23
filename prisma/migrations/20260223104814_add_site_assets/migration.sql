-- CreateTable
CREATE TABLE "site_assets" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_assets_key_key" ON "site_assets"("key");
