import "server-only";
import { createStripeCheckout, expireStripeSession } from "@/lib/payments/stripe";

// Proveedores de pago disponibles. Para agregar otro (p. ej. Mercado Pago),
// registra aquí su función de checkout y añade un botón con name="provider".
export const providers = {
  stripe: {
    createCheckout: createStripeCheckout,
    cancelCheckout: expireStripeSession,
  },
};

export { confirmStripeCheckout } from "@/lib/payments/stripe";
