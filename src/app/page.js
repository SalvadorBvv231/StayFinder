import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import TypeFilters from "@/components/TypeFilters";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const listings = await prisma.property.findMany({ orderBy: { id: "asc" } });

  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      <SearchBar />

      <div className="mx-auto max-w-7xl px-8 py-16">
        <TypeFilters />

        <div className="mt-16 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Alojamientos recomendados
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {listings.length} alojamientos encontrados
            </p>
          </div>
          <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
            <option>Recomendados</option>
            <option>Menor precio</option>
            <option>Mayor precio</option>
          </select>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

      <CtaSection />
      <Footer />
    </main>
  );
}