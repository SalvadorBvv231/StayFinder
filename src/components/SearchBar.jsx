"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get("city") || "";
  const currentGuests = searchParams.get("guests") || "";

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const city = (formData.get("city") || "").toString().trim();
    const guests = (formData.get("guests") || "").toString().trim();

    const params = new URLSearchParams(searchParams.toString());

    if (city) {
      params.set("city", city);
    } else {
      params.delete("city");
    }

    if (guests) {
      params.set("guests", guests);
    } else {
      params.delete("guests");
    }

    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("city");
    params.delete("guests");
    router.push(`/?${params.toString()}`);
  };

  const hasFilters = Boolean(currentCity || currentGuests);

  return (
    <div className="mx-auto -mt-12 max-w-4xl px-8">
      <form
        key={`${currentCity}-${currentGuests}`}
        onSubmit={handleSearch}
        className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Destino
            </label>
            <input
              name="city"
              type="text"
              defaultValue={currentCity}
              placeholder="¿A dónde quieres ir? (ej. Morelia, Pátzcuaro)"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-rose-500 focus:outline-none"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Huéspedes
            </label>
            <select
              name="guests"
              defaultValue={currentGuests}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-rose-500 focus:outline-none"
            >
              <option value="">Cualquiera</option>
              <option value="1">1+ huésped</option>
              <option value="2">2+ huéspedes</option>
              <option value="4">4+ huéspedes</option>
              <option value="6">6+ huéspedes</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-rose-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-rose-700 shadow-sm"
            >
              Buscar
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
