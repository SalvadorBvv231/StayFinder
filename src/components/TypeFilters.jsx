const types = ["Todos", "Casas", "Departamentos", "Cabañas", "Lofts"];

export default function TypeFilters() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Tipos de alojamiento</h2>
      <div className="flex flex-wrap gap-3">
        {types.map((type) => (
          <button
            key={type}
            className={
              type === "Todos"
                ? "rounded-full bg-[#0B1120] px-6 py-2 text-sm text-white"
                : "rounded-full border border-gray-300 px-6 py-2 text-sm text-gray-800"
            }
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
