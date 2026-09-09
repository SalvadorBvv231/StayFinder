import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingCard from "@/components/BookingCard";
import { prisma } from "@/lib/prisma";

export default async function ListingDetail({ params }) {
  const { id } = await params;
  const listing = await prisma.property.findUnique({
    where: { id: Number(id) },
  });

  if (!listing) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-8 py-20">
          <h1 className="text-2xl font-bold text-gray-900">
            Alojamiento no encontrado
          </h1>
          <p className="mt-2 text-gray-600">
            El alojamiento que buscas no existe o ha sido eliminado.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Volver al catálogo
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-8 py-12">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          ← Volver a alojamientos
        </Link>

        <img
          src={listing.image}
          alt={listing.title}
          className="mt-6 h-96 w-full rounded-2xl object-cover shadow-sm"
        />

        <div className="mt-8 flex flex-col gap-10 lg:flex-row">
          <div className="flex-1">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700">
              {listing.type}
            </span>
            <h1 className="mt-4 text-4xl font-bold text-gray-900">
              {listing.title}
            </h1>
            <p className="mt-2 text-gray-500">{listing.city}</p>
            <p className="mt-2 text-gray-900 font-semibold">★ {listing.rating}</p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-xl font-bold text-gray-900">
              Sobre este alojamiento
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              Espacio cómodo y bien ubicado, ideal para hasta {listing.guests}{" "}
              huéspedes. Incluye wifi de alta velocidad, cocina equipada y estacionamiento privado.
            </p>

            <h2 className="mt-8 text-xl font-bold text-gray-900">Servicios incluidos</h2>
            <ul className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">📶 Wifi de alta velocidad</li>
              <li className="flex items-center gap-2">🍳 Cocina completamente equipada</li>
              <li className="flex items-center gap-2">🚗 Estacionamiento gratuito</li>
              <li className="flex items-center gap-2">❄️ Aire acondicionado y calefacción</li>
              <li className="flex items-center gap-2">📺 Smart TV con streaming</li>
              <li className="flex items-center gap-2">☕ Cafetera y amenidades</li>
            </ul>
          </div>

          <BookingCard price={listing.price} guestsMax={listing.guests} />
        </div>
      </div>

      <Footer />
    </main>
  );
}