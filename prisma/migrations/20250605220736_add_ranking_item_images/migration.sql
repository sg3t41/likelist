-- CreateTable
CREATE TABLE "RankingItemImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "rankingItemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankingItemImage_rankingItemId_fkey" FOREIGN KEY ("rankingItemId") REFERENCES "RankingItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
