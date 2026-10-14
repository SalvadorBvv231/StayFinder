import "server-only";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Crea una sesión de Stripe Checkout para una reservación PENDING_PAYMENT.
export async function createStripeCheckout({ reservation, property, nights, baseUrl }) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: `${property.title} — ${nights} ${nights === 1 ? "noche" : "noches"}`,
            description: `${property.city} · ${reservation.guests} ${
              reservation.guests === 1 ? "huésped" : "huéspedes"
            } · incluye tarifa de servicio`,
          },
          unit_amount: reservation.totalPrice * 100, // Stripe usa centavos
        },
        quantity: 1,
      },
    ],
    client_reference_id: String(reservation.id),
    metadata: { reservationId: String(reservation.id) },
    // Stripe exige al menos 30 minutos; coincide con el bloqueo de fechas.
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    success_url: `${baseUrl}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pago-cancelado?reservation_id=${reservation.id}`,
  });

  return { id: session.id, url: session.url };
}

export async function retrieveStripeSession(sessionId) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

// Expira la sesión si sigue abierta para que ya no pueda pagarse.
export async function expireStripeSession(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status === "open") {
    await stripe.checkout.sessions.expire(sessionId);
  }
  return session;
}

export async function refundStripeSession(session) {
  if (session.payment_intent) {
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;
    await stripe.refunds.create({ payment_intent: paymentIntent });
  }
}

// Verifica con Stripe (nunca con la URL) y confirma la reservación si el pago está hecho.
// Resultado: { status: "confirmed" | "unpaid" | "invalid" | "refunded", reservation? }
export async function confirmStripeCheckout(sessionId) {
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return { status: "invalid" };
  }

  let session;
  try {
    session = await retrieveStripeSession(sessionId);
  } catch {
    return { status: "invalid" };
  }

  const reservationId = Number(session.metadata?.reservationId);
  const reservation = reservationId
    ? await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { Property: true },
      })
    : null;

  if (
    !reservation ||
    reservation.paymentProvider !== "stripe" ||
    reservation.paymentId !== session.id ||
    session.client_reference_id !== String(reservation.id)
  ) {
    return { status: "invalid" };
  }

  if (session.payment_status !== "paid") {
    return { status: "unpaid", reservation };
  }

  if (reservation.status === "CONFIRMED") {
    return { status: "confirmed", reservation };
  }

  // Pagada: confirmar, salvo que otra reservación confirmada ocupe ya esas fechas
  // (caso raro: el pago se completó después de vencer el bloqueo de 30 minutos).
  const confirmed = await prisma.$transaction(async (tx) => {
    const conflict = await tx.reservation.findFirst({
      where: {
        id: { not: reservation.id },
        propertyId: reservation.propertyId,
        status: "CONFIRMED",
        AND: [
          { startDate: { lt: reservation.endDate } },
          { endDate: { gt: reservation.startDate } },
        ],
      },
    });
    if (conflict) return false;

    await tx.reservation.updateMany({
      where: { id: reservation.id, status: { not: "CONFIRMED" } },
      data: { status: "CONFIRMED" },
    });
    return true;
  });

  if (!confirmed) {
    await refundStripeSession(session);
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED" },
    });
    return { status: "refunded", reservation };
  }

  return { status: "confirmed", reservation: { ...reservation, status: "CONFIRMED" } };
}
