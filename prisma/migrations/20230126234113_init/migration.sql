-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "usage" INTEGER NOT NULL DEFAULT 3,
    "domains" JSON NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "name" TEXT NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("name")
);
