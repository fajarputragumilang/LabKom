/*
  Warnings:

  - You are about to drop the column `mapel` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `materi` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `mataPelajaran` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "mapel",
DROP COLUMN "materi",
ADD COLUMN     "mataPelajaran" TEXT NOT NULL,
ALTER COLUMN "jamMulai" SET DATA TYPE TEXT,
ALTER COLUMN "jamSelesai" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_nama_key" ON "Lab"("nama");

-- CreateIndex
CREATE INDEX "Booking_labId_tanggal_idx" ON "Booking"("labId", "tanggal");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
