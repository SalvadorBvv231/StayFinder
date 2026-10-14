import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { listings } from "../src/data/listings.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.property.deleteMany();
  await prisma.property.createMany({
    data: listings.map((l) => ({
      title: l.title,
      city: l.city,
      type: l.type,
      guests: l.guests,
      price: l.price,
      rating: l.rating,
      image: l.image,
    })),
  });
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
