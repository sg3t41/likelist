/*
  Warnings:

  - You are about to drop the column `sourceSubCategoryId` on the `RankingItem` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSubCategoryName` on the `RankingItem` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "MainCategoryItemReference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mainCategoryId" TEXT NOT NULL,
    "rankingItemId" TEXT NOT NULL,
    "position" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MainCategoryItemReference_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MainCategoryItemReference_rankingItemId_fkey" FOREIGN KEY ("rankingItemId") REFERENCES "RankingItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RankingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER,
    "subCategoryId" TEXT,
    "mainCategoryId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RankingItem_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RankingItem_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RankingItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RankingItem" ("createdAt", "description", "id", "mainCategoryId", "position", "subCategoryId", "title", "updatedAt", "userId") SELECT "createdAt", "description", "id", "mainCategoryId", "position", "subCategoryId", "title", "updatedAt", "userId" FROM "RankingItem";
DROP TABLE "RankingItem";
ALTER TABLE "new_RankingItem" RENAME TO "RankingItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MainCategoryItemReference_mainCategoryId_rankingItemId_key" ON "MainCategoryItemReference"("mainCategoryId", "rankingItemId");
