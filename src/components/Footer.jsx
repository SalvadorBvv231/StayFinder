export default function Footer() {
  return (
    <footer className="bg-[#0B1120] px-8 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold">StayFinder</p>
          <p className="mt-1 text-sm text-gray-400">
            Proyecto educativo desarrollado con Next.js.
          </p>
        </div>
        <p className="text-sm text-gray-400">
          © 2026 StayFinder. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
