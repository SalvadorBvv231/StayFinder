import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { listings } from "../src/data/listings.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Ids estables (los de listings.js) para que /alojamiento/1..6 no cambie al
  // volver a sembrar. Upsert en vez de deleteMany: Reservation tiene
  // onDelete: Cascade y borrar propiedades eliminaría las reservas.
  const ids = listings.map((l) => l.id);
  await prisma.property.deleteMany({ where: { id: { notIn: ids } } });
  for (const { id, ...data } of listings) {
    await prisma.property.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }
  // Al insertar ids explícitos la secuencia no avanza; se ajusta al máximo.
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Property"', 'id'), (SELECT MAX(id) FROM "Property"))`;
  console.log("Listo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
