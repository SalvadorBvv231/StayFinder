"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { startCheckout } from "@/app/actions/reservations";

export default function BookingCard({
  propertyId,
  price,
  guestsMax,
  bookedRanges = [],
  user = null,
}) {
  const [state, action, pending] = useActionState(startCheckout, undefined);

  // Fechas por defecto: mañana hasta 3 días después
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const defaultOut = new Date();
  defaultOut.setDate(defaultOut.getDate() + 4);
  const defaultOutStr = defaultOut.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [endDate, setEndDate] = useState(defaultOutStr);
  const [guests, setGuests] = useState(1);

  // Calcular número de noches
  let nights = 0;
  if (startDate && endDate) {
    const s = new Date(`${startDate}T00:00:00`);
    const e = new Date(`${endDate}T00:00:00`);
    if (e > s) {
      nights = Math.round((e - s) / (1000 * 60 * 60 * 24));
    }
  }

  // Verificar si las fechas seleccionadas se cruzan con una reservación existente
  const isOverlapping = bookedRanges.some((range) => {
    const rStart = new Date(`${range.startDate}T00:00:00`);
    const rEnd = new Date(`${range.endDate}T00:00:00`);
    const s = new Date(`${startDate}T00:00:00`);
    const e = new Date(`${endDate}T00:00:00`);
    return s < rEnd && e > rStart;
  });

  const subtotal = price * (nights > 0 ? nights : 1);
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  return (
    <aside className="w-full sm:w-80">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-700">
          <span className="text-2xl font-bold text-gray-900">
            ${price.toLocaleString("es-MX")}
          </span>{" "}
          MXN <span className="text-sm font-normal text-gray-500">noche</span>
        </p>

        {bookedRanges.length > 0 && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            <p className="font-semibold">Fechas ya reservadas:</p>
            <ul className="mt-1 list-disc list-inside space-y-0.5">
              {bookedRanges.map((range, idx) => (
                <li key={idx}>
                  {range.startDate} al {range.endDate}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="propertyId" value={propertyId} />

          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {state.error}
              {state.needLogin && (
                <div className="mt-2">
                  <Link
                    href="/login"
                    className="inline-block font-bold text-rose-600 underline"
                  >
                    Iniciar sesión aquí →
                  </Link>
                </div>
              )}
            </div>
          )}

          {isOverlapping && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              ⚠️ Las fechas elegidas coinciden con una estancia ya reservada. Por favor selecciona otras fechas.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Llegada
              </label>
              <input
                type="date"
                name="startDate"
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-xs text-gray-800 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Salida
              </label>
              <input
                type="date"
                name="endDate"
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-xs text-gray-800 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Huéspedes (máx. {guestsMax})
            </label>
            <select
              name="guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-rose-500 focus:outline-none"
            >
              {Array.from({ length: guestsMax }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "huésped" : "huéspedes"}
                </option>
              ))}
            </select>
          </div>

          {nights > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>
                  ${price.toLocaleString("es-MX")} x {nights} {nights === 1 ? "noche" : "noches"}
                </span>
                <span>${subtotal.toLocaleString("es-MX")} MXN</span>
              </div>
              <div className="flex justify-between">
                <span>Tarifa de servicio (12%)</span>
                <span>${serviceFee.toLocaleString("es-MX")} MXN</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                <span>Total</span>
                <span>${total.toLocaleString("es-MX")} MXN</span>
              </div>
            </div>
          )}

          {!user ? (
            <Link
              href="/login"
              className="block w-full text-center rounded-lg bg-rose-600 py-3 text-sm font-bold text-white transition hover:bg-rose-700 shadow-sm"
            >
              Iniciar sesión para reservar
            </Link>
          ) : (
            <button
              type="submit"
              name="provider"
              value="stripe"
              disabled={pending || isOverlapping || nights <= 0}
              className="w-full cursor-pointer rounded-lg bg-rose-600 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {pending
                ? "Redirigiendo a Stripe..."
                : isOverlapping
                ? "Fechas no disponibles"
                : "Reservar y pagar con Stripe"}
            </button>
          )}

          <p className="text-center text-xs text-gray-400">
            Cancelación gratuita antes de la fecha de llegada
          </p>
          <p className="rounded-lg bg-gray-50 p-2 text-center text-[11px] text-gray-500 border border-gray-200">
            Modo de prueba — no se realizan cargos reales. Usa la tarjeta 4242 4242 4242 4242.
          </p>
        </form>
      </div>
    </aside>
  );
}
