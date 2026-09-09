import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import TypeFilters from "@/components/TypeFilters";
import SortSelector from "@/components/SortSelector";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { prisma } from "@/lib/prisma";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const city = params?.city;
  const type = params?.type;
  const guests = params?.guests ? parseInt(params.guests, 10) : undefined;
  const sort = params?.sort;

  const where = {};

  if (city) {
    where.OR = [
      { city: { contains: city, mode: "insensitive" } },
      { title: { contains: city, mode: "insensitive" } },
    ];
  }

  if (type && type !== "Todos") {
    where.type = { equals: type, mode: "insensitive" };
  }

  if (guests && !isNaN(guests) && guests > 0) {
    where.guests = { gte: guests };
  }

  let orderBy = { id: "asc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "rating-desc") orderBy = { rating: "desc" };

  const listings = await prisma.property.findMany({
    where,
    orderBy,
  });

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Suspense fallback={<div className="h-24" />}>
        <SearchBar />
      </Suspense>

      <div className="mx-auto max-w-7xl px-8 py-16">
        <Suspense fallback={<div className="h-10" />}>
          <TypeFilters />
        </Suspense>

        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {type && type !== "Todos"
                ? `Alojamientos: ${type}s`
                : "Alojamientos recomendados"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {listings.length}{" "}
              {listings.length === 1
                ? "alojamiento encontrado"
                : "alojamientos encontrados"}
              {city ? ` para "${city}"` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Ordenar por:</span>
            <Suspense fallback={<div className="h-9 w-32" />}>
              <SortSelector />
            </Suspense>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-lg font-semibold text-gray-800">
              No encontramos alojamientos con esos criterios
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Prueba buscando otra ciudad o cambiando los filtros de huéspedes o tipo de lugar.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <CtaSection />
      <Footer />
    </main>
  );
}