import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export default async function ListingDetail({ params }) {
  const { id } = await params;
  const listing = await prisma.property.findUnique({ where: { id: Number(id) } });

  if (!listing) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-7xl px-8 py-20">
          <p className="text-gray-700">Alojamiento no encontrado.</p>
          <Link href="/" className="mt-4 inline-block text-rose-600">
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-8 py-12">
        <Link href="/" className="text-sm text-gray-500">
          ← Volver a alojamientos
        </Link>

        <img
          src={listing.image}
          alt={listing.title}
          className="mt-6 h-96 w-full rounded-2xl object-cover"
        />

        <div className="mt-8 flex flex-col gap-10 sm:flex-row">
          <div className="flex-1">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700">
              {listing.type}
            </span>
            <h1 className="mt-4 text-4xl font-bold text-gray-900">
              {listing.title}
            </h1>
            <p className="mt-2 text-gray-500">{listing.city}</p>
            <p className="mt-2 text-gray-900">★ {listing.rating}</p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-xl font-bold text-gray-900">
              Sobre este alojamiento
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              Espacio cómodo y bien ubicado, ideal para hasta {listing.guests}{" "}
              huéspedes. Incluye wifi, cocina equipada y estacionamiento.
            </p>

            <h2 className="mt-8 text-xl font-bold text-gray-900">Servicios</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-gray-600">
              <li>Wifi</li>
              <li>Cocina</li>
              <li>Estacionamiento</li>
              <li>Aire acondicionado</li>
            </ul>
          </div>

          <aside className="w-full sm:w-72">
            <div className="rounded-2xl border border-gray-200 p-6">
              <p className="text-gray-700">
                <span className="text-2xl font-bold text-gray-900">
                  ${listing.price.toLocaleString("es-MX")}
                </span>{" "}
                MXN por noche
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Hasta {listing.guests} huéspedes
              </p>
              <button className="mt-6 w-full rounded-lg bg-rose-600 py-3 text-sm font-bold text-white">
                Reservar
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}