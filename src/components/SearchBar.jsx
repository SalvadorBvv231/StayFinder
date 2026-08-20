export default function SearchBar() {
  return (
    <div className="mx-auto -mt-12 max-w-4xl px-8">
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm text-gray-700">Destino</label>
            <input
              type="text"
              placeholder="¿A dónde quieres ir?"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="mb-2 block text-sm text-gray-700">Huéspedes</label>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm">
              <option>Cualquiera</option>
              <option>1-2</option>
              <option>3-4</option>
              <option>5 o más</option>
            </select>
          </div>
          <button className="rounded-lg bg-rose-600 px-8 py-3 text-sm font-bold text-white">
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
