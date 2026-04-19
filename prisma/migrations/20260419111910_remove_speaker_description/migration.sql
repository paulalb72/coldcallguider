/*
  Warnings:

  - You are about to drop the column `description` on the `Script` table. All the data in the column will be lost.
  - You are about to drop the column `speaker` on the `Step` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Script" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "startStepId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Script_startStepId_fkey" FOREIGN KEY ("startStepId") REFERENCES "Step" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Script" ("createdAt", "id", "startStepId", "title", "updatedAt") SELECT "createdAt", "id", "startStepId", "title", "updatedAt" FROM "Script";
DROP TABLE "Script";
ALTER TABLE "new_Script" RENAME TO "Script";
CREATE UNIQUE INDEX "Script_startStepId_key" ON "Script"("startStepId");
CREATE INDEX "Script_updatedAt_idx" ON "Script"("updatedAt");
CREATE TABLE "new_Step" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scriptId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "note" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Step_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Step" ("content", "createdAt", "id", "name", "note", "position", "scriptId", "updatedAt") SELECT "content", "createdAt", "id", "name", "note", "position", "scriptId", "updatedAt" FROM "Step";
DROP TABLE "Step";
ALTER TABLE "new_Step" RENAME TO "Step";
CREATE INDEX "Step_scriptId_position_idx" ON "Step"("scriptId", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
