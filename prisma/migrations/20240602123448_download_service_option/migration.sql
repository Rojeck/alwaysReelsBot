/*
  Warnings:

  - You are about to drop the column `groupType` on the `AuditEvents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditEvents" DROP COLUMN "groupType",
ADD COLUMN     "downloadService" TEXT;
