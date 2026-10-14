"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { providers } from "@/lib/payments";
import { expireStalePending, getBaseUrl, validateReservation } from "@/lib/reservations";

export async function startCheckout(prevState, formData) {
  const user = await getUser();

  if (!user) {
    return {
      error: "Debes iniciar sesión para realizar una reservación.",
      needLogin: true,
    };
  }

  const providerName = formData.get("provider")?.toString();
  const provider = providers[providerName];

  if (!provider) {
    return { error: "Método de pago no válido." };
  }

  let checkoutUrl;

  try {
    await expireStalePending();

    const result = await validateReservation(formData);
    if (result.error) {
      return { error: result.error };
    }

    const { property, startDate, endDate, guests, nights, totalPrice } = result;

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        startDate,
        endDate,
        guests,
        totalPrice,
        status: "PENDING_PAYMENT",
        paymentProvider: providerName,
      },
    });

    try {
      const checkout = await provider.createCheckout({
        reservation,
        property,
        nights,
        baseUrl: await getBaseUrl(),
      });

      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { paymentId: checkout.id },
      });

      checkoutUrl = checkout.url;
    } catch (error) {
      // Si no se pudo crear el pago, liberar las fechas
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "CANCELLED" },
      });
      throw error;
    }
  } catch (error) {
    console.error("startCheckout:", error?.message);
    return {
      error: "No se pudo iniciar el pago. Intenta de nuevo.",
    };
  }

  // redirect() lanza una excepción, por eso va fuera del try/catch
  redirect(checkoutUrl);
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

    if (reservation.status === "CANCELLED") {
      return { success: true };
    }

    // Si el pago sigue abierto, cerrarlo para que no pueda completarse después
    if (reservation.status === "PENDING_PAYMENT" && reservation.paymentId) {
      await providers[reservation.paymentProvider]?.cancelCheckout(reservation.paymentId);
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
