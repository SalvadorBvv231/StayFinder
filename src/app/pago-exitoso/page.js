import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { confirmStripeCheckout } from "@/lib/payments";
import { countNights } from "@/lib/reservations";

export const metadata = { title: "Pago de reservación | StayFinder" };

const formatDate = (dateObj) =>
  new Date(dateObj).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const messages = {
  unpaid: {
    title: "Pago no completado",
    text: "Stripe todavía no reporta el pago de esta reservación. Si ya pagaste, espera unos segundos y recarga la página.",
  },
  invalid: {
    title: "No pudimos verificar el pago",
    text: "El enlace de pago no es válido o no corresponde a ninguna reservación.",
  },
  refunded: {
    title: "Fechas no disponibles",
    text: "Tu pago se recibió, pero otra persona confirmó esas fechas antes. Reembolsamos el cargo completo y la reservación quedó cancelada.",
  },
};

export default async function PagoExitosoPage({ searchParams }) {
  const { session_id: sessionId } = await searchParams;
  const { status, reservation } = await confirmStripeCheckout(sessionId?.toString());

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="mx-auto max-w-xl px-6 py-16">
          {status === "confirmed" ? (
            <Confirmed reservation={reservation} />
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
                !
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                {messages[status].title}
              </h1>
              <p className="mt-2 text-sm text-gray-600">{messages[status].text}</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href="/mis-reservas"
                  className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
                >
                  Ver mis reservaciones
                </Link>
                {reservation && (
                  <Link
                    href={`/alojamiento/${reservation.propertyId}`}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Volver al alojamiento
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Confirmed({ reservation }) {
  const prop = reservation.Property;
  const nights = countNights(new Date(reservation.startDate), new Date(reservation.endDate));

  return (
    <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="bg-green-50 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-600">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-green-900">
          ¡Pago realizado correctamente!
        </h1>
        <p className="mt-2 text-sm text-green-700">
          Tu reservación #{reservation.id} está confirmada.
        </p>
      </div>

      <div className="p-6">
        <div className="flex gap-4">
          <img
            src={prop.image}
            alt={prop.title}
            className="h-20 w-28 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-bold text-gray-900">{prop.title}</h2>
            <p className="text-xs text-gray-500">{prop.city}</p>
            <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              Pagada
            </span>
          </div>
        </div>

        <dl className="mt-6 space-y-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          <div className="flex justify-between">
            <dt>Llegada</dt>
            <dd className="font-semibold text-gray-900">{formatDate(reservation.startDate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Salida</dt>
            <dd className="font-semibold text-gray-900">{formatDate(reservation.endDate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Estancia</dt>
            <dd>
              {nights} {nights === 1 ? "noche" : "noches"} • {reservation.guests}{" "}
              {reservation.guests === 1 ? "huésped" : "huéspedes"}
            </dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
            <dt>Total pagado</dt>
            <dd>${reservation.totalPrice.toLocaleString("es-MX")} MXN</dd>
          </div>
        </dl>

        <Link
          href="/mis-reservas"
          className="mt-6 block w-full rounded-lg bg-rose-600 py-3 text-center text-sm font-bold text-white transition hover:bg-rose-700"
        >
          Ver mis reservaciones
        </Link>
      </div>
    </div>
  );
}
