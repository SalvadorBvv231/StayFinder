"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/app/actions/auth";

export async function createReservation(prevState, formData) {
  const user = await getUser();

  if (!user) {
    return {
      error: "Debes iniciar sesión para realizar una reservación.",
      needLogin: true,
    };
  }

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

  const diffTime = endDate.getTime() - startDate.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (nights < 1) {
    return { error: "La estancia mínima es de 1 noche." };
  }

  try {
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

    // Verificar si existe conflicto con reservaciones confirmadas existentes (bloqueo de fechas)
    const overlapping = await prisma.reservation.findFirst({
      where: {
        propertyId: propertyId,
        status: "CONFIRMED",
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gt: startDate } },
        ],
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

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        startDate,
        endDate,
        guests,
        totalPrice,
        status: "CONFIRMED",
      },
    });

    revalidatePath(`/alojamiento/${propertyId}`);
    revalidatePath("/mis-reservas");

    return {
      success: true,
      reservationId: reservation.id,
      nights,
      totalPrice,
      startDate: startDateStr,
      endDate: endDateStr,
      guests,
    };
  } catch (error) {
    return {
      error: "Ocurrió un error al procesar la reservación. Intenta de nuevo.",
    };
  }
}

export async function cancelReservation(reservationId) {
  const user = await getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const id = Number(reservationId);
  if (!id || isNaN(id)) {
    return { error: "ID de reservación inválido." };
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation || reservation.userId !== user.id) {
      return { error: "Reservación no encontrada o no pertenece a tu cuenta." };
    }

    await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/mis-reservas");
    revalidatePath(`/alojamiento/${reservation.propertyId}`);

    return { success: true };
  } catch (error) {
    return { error: "Error al cancelar la reservación." };
  }
}
