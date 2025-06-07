-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RankingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "position" INTEGER,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "subCategoryId" TEXT,
    "mainCategoryId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RankingItem_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RankingItem_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RankingItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RankingItem" ("createdAt", "description", "id", "mainCategoryId", "position", "subCategoryId", "title", "updatedAt", "url", "userId") SELECT "createdAt", "description", "id", "mainCategoryId", "position", "subCategoryId", "title", "updatedAt", "url", "userId" FROM "RankingItem";
DROP TABLE "RankingItem";
ALTER TABLE "new_RankingItem" RENAME TO "RankingItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
