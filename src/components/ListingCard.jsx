import Link from "next/link";

export default function ListingCard({ listing }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-56 w-full object-cover"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-900">
          {listing.type}
        </span>
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700">
          ♡
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-gray-900">{listing.title}</h3>
          <span className="whitespace-nowrap text-sm text-gray-900">
            ★ {listing.rating}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{listing.city}</p>
        <p className="mt-4 text-sm text-gray-500">
          Hasta {listing.guests} huéspedes
        </p>
        <p className="mt-3 text-gray-700">
          <span className="text-lg font-bold text-gray-900">
            ${listing.price.toLocaleString("es-MX")}
          </span>{" "}
          MXN por noche
        </p>

        <Link
          href={`/alojamiento/${listing.id}`}
          className="mt-5 block rounded-lg bg-[#0B1120] py-3 text-center text-sm font-bold text-white"
        >
          Ver alojamiento
        </Link>
      </div>
    </div>
  );
}
