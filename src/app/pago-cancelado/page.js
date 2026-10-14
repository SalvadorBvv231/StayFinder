import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/app/actions/auth";
import { providers } from "@/lib/payments";

export const metadata = { title: "Pago cancelado | StayFinder" };

export default async function PagoCanceladoPage({ searchParams }) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { reservation_id: reservationIdParam } = await searchParams;
  const reservationId = Number(reservationIdParam);

  const reservation = reservationId
    ? await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { Property: true },
      })
    : null;

  const owned = reservation && reservation.userId === user.id;

  if (owned && reservation.status === "PENDING_PAYMENT") {
    // Cerrar la sesión de pago; si resulta que sí se pagó, ir a la verificación.
    const session = reservation.paymentId
      ? await providers[reservation.paymentProvider]?.cancelCheckout(reservation.paymentId)
      : null;

    if (session?.payment_status === "paid") {
      redirect(`/pago-exitoso?session_id=${session.id}`);
    }

    await prisma.reservation.updateMany({
      where: { id: reservation.id, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED" },
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-500">
              ✕
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              El pago fue cancelado
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              No se realizó ningún cargo.
              {owned && reservation.Property
                ? ` La reservación en ${reservation.Property.title} quedó cancelada y las fechas se liberaron.`
                : ""}
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              {owned && (
                <Link
                  href={`/alojamiento/${reservation.propertyId}`}
                  className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
                >
                  Volver a intentar
                </Link>
              )}
              <Link
                href="/mis-reservas"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Ver mis reservaciones
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
