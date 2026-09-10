import Link from "next/link";
import { getUser } from "@/app/actions/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const user = await getUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 py-4">
        <Link href="/" className="text-xl font-bold text-rose-600">
          StayFinder
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm text-gray-800">
          <Link href="/" className="hover:text-rose-600 transition">
            Alojamientos
          </Link>

          {user ? (
            <>
              <Link
                href="/mis-reservas"
                className="font-medium text-gray-700 hover:text-rose-600 transition flex items-center gap-1"
              >
                <span>📅</span>
                <span>Mis Reservas</span>
              </Link>
              <span className="hidden sm:inline font-medium text-gray-900 border-l border-gray-200 pl-4">
                Hola, {user.name.split(" ")[0]}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-800 hover:text-rose-600 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 shadow-xs"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
