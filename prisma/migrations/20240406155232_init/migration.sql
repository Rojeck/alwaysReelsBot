-- CreateTable
CREATE TABLE "AuditEvents" (
    "id" SERIAL NOT NULL,
    "postUrl" TEXT NOT NULL,
    "userTag" TEXT,
    "groupName" TEXT,
    "groupType" TEXT,
    "groupId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvents_pkey" PRIMARY KEY ("id")
);
