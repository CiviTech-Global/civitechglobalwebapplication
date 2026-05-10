/*
  Warnings:

  - You are about to drop the `internship_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `internships` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('JOB', 'INTERNSHIP');

-- DropForeignKey
ALTER TABLE "internship_applications" DROP CONSTRAINT "internship_applications_internshipId_fkey";

-- DropForeignKey
ALTER TABLE "internship_applications" DROP CONSTRAINT "internship_applications_userId_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "githubUrl" TEXT,
ALTER COLUMN "price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "category" TEXT DEFAULT 'SUPPORT';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "internship_applications";

-- DropTable
DROP TABLE "internships";

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "duration" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Remote',
    "opportunityType" "OpportunityType" NOT NULL DEFAULT 'INTERNSHIP',
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "resumeUrl" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_slug_key" ON "opportunities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_applications_userId_opportunityId_key" ON "opportunity_applications"("userId", "opportunityId");

-- AddForeignKey
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
