import "server-only";
import Stripe from "stripe";

// Cliente de Stripe solo para el servidor: la llave secreta nunca llega al navegador.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
