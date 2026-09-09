"use client";

import { useState } from "react";

export default function BookingCard({ price, guestsMax }) {
  const [nights, setNights] = useState(3);
  const [guests, setGuests] = useState(1);
  const [reserved, setReserved] = useState(false);

  const total = price * nights;
  const serviceFee = Math.round(total * 0.12);
  const grandTotal = total + serviceFee;

  if (reserved) {
    return (
      <aside className="w-full sm:w-80">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-xl font-bold">
            ✓
          </div>
          <h3 className="mt-4 text-lg font-bold text-green-900">
            ¡Reserva confirmada!
          </h3>
          <p className="mt-2 text-sm text-green-700">
            Tu solicitud para {guests} {guests === 1 ? "huésped" : "huéspedes"} por {nights} noches ha sido registrada.
          </p>
          <div className="mt-4 border-t border-green-200 pt-3 text-xs text-green-800">
            Total pagado: <strong>${grandTotal.toLocaleString("es-MX")} MXN</strong>
          </div>
          <button
            onClick={() => setReserved(false)}
            className="mt-6 w-full rounded-lg bg-gray-900 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            Modificar reserva
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full sm:w-80">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-700">
          <span className="text-2xl font-bold text-gray-900">
            ${price.toLocaleString("es-MX")}
          </span>{" "}
          MXN <span className="text-sm font-normal text-gray-500">noche</span>
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Número de noches
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={nights}
              onChange={(e) => setNights(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Huéspedes (máx. {guestsMax})
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {Array.from({ length: guestsMax }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "huésped" : "huéspedes"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>${price.toLocaleString("es-MX")} x {nights} noches</span>
            <span>${total.toLocaleString("es-MX")} MXN</span>
          </div>
          <div className="flex justify-between">
            <span>Tarifa de servicio (12%)</span>
            <span>${serviceFee.toLocaleString("es-MX")} MXN</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
            <span>Total</span>
            <span>${grandTotal.toLocaleString("es-MX")} MXN</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReserved(true)}
          className="mt-6 w-full rounded-lg bg-rose-600 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
        >
          Reservar ahora
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">
          No se hará ningún cargo todavía
        </p>
      </div>
    </aside>
  );
}
