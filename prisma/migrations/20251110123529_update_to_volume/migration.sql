/*
  Warnings:

  - You are about to drop the column `quantity` on the `FoodItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `FoodItem` table. All the data in the column will be lost.
  - Added the required column `daysUntilExpiry` to the `FoodItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `FoodItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FoodItem" DROP COLUMN "quantity",
DROP COLUMN "unit",
ADD COLUMN     "daysUntilExpiry" INTEGER NOT NULL,
ADD COLUMN     "volume" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "volumeUnit" TEXT NOT NULL DEFAULT 'g';

-- CreateIndex
CREATE INDEX "FoodItem_daysUntilExpiry_idx" ON "public"."FoodItem"("daysUntilExpiry");

-- CreateIndex
CREATE INDEX "FoodItem_status_idx" ON "public"."FoodItem"("status");

-- CreateIndex
CREATE INDEX "FoodItem_expiryDate_idx" ON "public"."FoodItem"("expiryDate");
