import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Minutos que una reservación PENDING_PAYMENT bloquea las fechas mientras el usuario paga.
export const PENDING_HOLD_MINUTES = 30;

function holdCutoff() {
  return new Date(Date.now() - PENDING_HOLD_MINUTES * 60 * 1000);
}

// Reservaciones que ocupan fechas: confirmadas o pendientes de pago recientes.
export function blockingStatusWhere() {
  return {
    OR: [
      { status: "CONFIRMED" },
      { status: "PENDING_PAYMENT", createdAt: { gte: holdCutoff() } },
    ],
  };
}

// Las pendientes que superaron el tiempo de espera se marcan como canceladas.
export async function expireStalePending(where = {}) {
  await prisma.reservation.updateMany({
    where: { ...where, status: "PENDING_PAYMENT", createdAt: { lt: holdCutoff() } },
    data: { status: "CANCELLED" },
  });
}

export function countNights(startDate, endDate) {
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

// Valida el formulario de reservación y calcula el precio del lado del servidor.
export async function validateReservation(formData) {
  const propertyId = Number(formData.get("propertyId"));
  const startDateStr = formData.get("startDate")?.toString();
  const endDateStr = formData.get("endDate")?.toString();
  const guests = Number(formData.get("guests") || 1);

  if (!propertyId || isNaN(propertyId)) {
    return { error: "Alojamiento no válido." };
  }

  if (!startDateStr || !endDateStr) {
    return { error: "Debes seleccionar las fechas de llegada y salida." };
  }

  const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
  const endDate = new Date(`${endDateStr}T00:00:00.000Z`);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: "Fechas no válidas." };
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (startDate < today) {
    return { error: "La fecha de llegada no puede ser en el pasado." };
  }

  if (endDate <= startDate) {
    return { error: "La fecha de salida debe ser posterior a la fecha de llegada." };
  }

  const nights = countNights(startDate, endDate);

  if (nights < 1) {
    return { error: "La estancia mínima es de 1 noche." };
  }

  if (!Number.isInteger(guests) || guests < 1) {
    return { error: "Número de huéspedes no válido." };
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    return { error: "El alojamiento no existe." };
  }

  if (guests > property.guests) {
    return {
      error: `El número de huéspedes (${guests}) excede el límite permitido (${property.guests}).`,
    };
  }

  // Bloqueo de fechas: confirmadas o en proceso de pago
  const overlapping = await prisma.reservation.findFirst({
    where: {
      propertyId,
      ...blockingStatusWhere(),
      AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
    },
  });

  if (overlapping) {
    return {
      error:
        "Las fechas seleccionadas ya no están disponibles para este alojamiento. Por favor elige otras fechas.",
    };
  }

  const subtotal = property.price * nights;
  const serviceFee = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + serviceFee;

  return { property, startDate, endDate, guests, nights, totalPrice };
}

// URL base a partir de la petición actual: funciona en localhost y en Vercel.
export async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto")?.split(",")[0] ??
    (host?.startsWith("localhost") || host?.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
