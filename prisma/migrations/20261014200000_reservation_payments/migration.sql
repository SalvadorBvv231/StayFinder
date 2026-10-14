-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED');

-- AlterTable: convert existing TEXT values (CONFIRMED / CANCELLED) in place
ALTER TABLE "Reservation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Reservation" ALTER COLUMN "status" TYPE "ReservationStatus" USING ("status"::"ReservationStatus");
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';
ALTER TABLE "Reservation" ADD COLUMN "paymentProvider" TEXT,
ADD COLUMN "paymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_paymentId_key" ON "Reservation"("paymentId");
