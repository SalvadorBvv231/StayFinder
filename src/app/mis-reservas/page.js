import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CancelReservationButton from "@/components/CancelReservationButton";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/app/actions/auth";
import { expireStalePending } from "@/lib/reservations";

const statusBadge = {
  CONFIRMED: { label: "Pagada", className: "bg-green-100 text-green-700" },
  PENDING_PAYMENT: { label: "Pendiente de pago", className: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "Cancelada", className: "bg-red-100 text-red-700" },
};

export default async function MisReservasPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  await expireStalePending({ userId: user.id });

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    include: { Property: true },
    orderBy: { startDate: "asc" },
  });

  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  const upcoming = reservations.filter(
    (r) => r.status !== "CANCELLED" && new Date(r.endDate) >= now
  );

  const pastOrCancelled = reservations.filter(
    (r) => r.status === "CANCELLED" || new Date(r.endDate) < now
  );

  const formatDate = (dateObj) => {
    return new Date(dateObj).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mis Reservaciones y Estancias
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Revisa tus próximas vacaciones, fechas de estancia e historial.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 text-center"
            >
              + Explorar más alojamientos
            </Link>
          </div>

          {reservations.length === 0 ? (
            <div className="my-16 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl text-rose-600">
                📅
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Aún no tienes ninguna reservación
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Encuentra cabañas, lofts, casas y departamentos ideales para tu próxima escapada.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-lg bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Buscar alojamientos
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-12">
              {/* Próximas Estancias */}
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Próximas Estancias
                  </h2>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    {upcoming.length} activa{upcoming.length === 1 ? "" : "s"}
                  </span>
                </div>

                {upcoming.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500 italic">
                    No tienes estancias próximas programadas.
                  </p>
                ) : (
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {upcoming.map((res) => {
                      const nights = Math.round(
                        (new Date(res.endDate) - new Date(res.startDate)) /
                          (1000 * 60 * 60 * 24)
                      );
                      const prop = res.Property || res.property;
                      return (
                        <div
                          key={res.id}
                          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
                        >
                          <div className="flex flex-col sm:flex-row">
                            <img
                              src={prop?.image}
                              alt={prop?.title}
                              className="h-44 sm:h-auto sm:w-48 object-cover"
                            />
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                                    {prop?.type}
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusBadge[res.status].className}`}
                                  >
                                    {statusBadge[res.status].label}
                                  </span>
                                </div>
                                <h3 className="mt-2 text-lg font-bold text-gray-900">
                                  {prop?.title}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {prop?.city}
                                </p>
                              </div>

                              <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
                                <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                  <span>📅 {formatDate(res.startDate)}</span>
                                  <span>➔</span>
                                  <span>{formatDate(res.endDate)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-200">
                                  <span>
                                    {nights} {nights === 1 ? "noche" : "noches"} • {res.guests}{" "}
                                    {res.guests === 1 ? "huésped" : "huéspedes"}
                                  </span>
                                  <span className="font-bold text-gray-900">
                                    ${res.totalPrice.toLocaleString("es-MX")} MXN
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 flex items-center justify-between">
                            <Link
                              href={`/alojamiento/${prop?.id}`}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Ver ficha del alojamiento →
                            </Link>
                            <CancelReservationButton reservationId={res.id} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Historial o Canceladas */}
              {pastOrCancelled.length > 0 && (
                <div className="border-t border-gray-200 pt-10">
                  <h2 className="text-xl font-bold text-gray-700">
                    Historial y Cancelaciones
                  </h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pastOrCancelled.map((res) => {
                      const prop = res.Property || res.property;
                      return (
                        <div
                          key={res.id}
                          className="rounded-xl border border-gray-200 bg-white p-4 opacity-75 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-gray-800 truncate">
                              {prop?.title}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                res.status === "CONFIRMED"
                                  ? "bg-gray-100 text-gray-600"
                                  : statusBadge[res.status].className
                              }`}
                            >
                              {res.status === "CONFIRMED" ? "Completada" : statusBadge[res.status].label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {prop?.city}
                          </p>
                          <div className="mt-3 text-xs text-gray-600">
                            {formatDate(res.startDate)} al {formatDate(res.endDate)}
                          </div>
                          <div className="mt-2 text-xs font-semibold text-gray-900">
                            Total: ${res.totalPrice.toLocaleString("es-MX")} MXN
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
