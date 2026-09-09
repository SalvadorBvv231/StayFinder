"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = [
  { label: "Todos", value: "Todos" },
  { label: "Casas", value: "Casa" },
  { label: "Departamentos", value: "Departamento" },
  { label: "Cabañas", value: "Cabaña" },
  { label: "Lofts", value: "Loft" },
];

export default function TypeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");

  const handleSelect = (val) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "Todos") {
      params.delete("type");
    } else {
      params.set("type", val);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Tipos de alojamiento
      </h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isActive =
            (cat.value === "Todos" && !currentType) || currentType === cat.value;

          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleSelect(cat.value)}
              className={
                isActive
                  ? "cursor-pointer rounded-full bg-[#0B1120] px-6 py-2 text-sm font-medium text-white transition shadow-sm"
                  : "cursor-pointer rounded-full border border-gray-300 px-6 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
              }
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
