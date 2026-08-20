export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <span className="text-xl font-bold text-rose-600">StayFinder</span>
        <nav className="flex items-center gap-6 text-sm text-gray-800">
          <a href="#alojamientos">Alojamientos</a>
          <a href="#favoritos">Favoritos</a>
          <a href="#acerca">Acerca de</a>
        </nav>
      </div>
    </header>
  );
}
