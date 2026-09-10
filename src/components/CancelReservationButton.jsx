"use client";

import { useTransition } from "react";
import { cancelReservation } from "@/app/actions/reservations";

export default function CancelReservationButton({ reservationId }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (confirm("¿Estás seguro de que deseas cancelar esta reservación?")) {
      startTransition(async () => {
        await cancelReservation(reservationId);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className="cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Cancelando..." : "Cancelar reservación"}
    </button>
  );
}
