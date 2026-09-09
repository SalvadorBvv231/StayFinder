import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("city");
    const type = searchParams.get("type");
    const guests = searchParams.get("guests");
    const sort = searchParams.get("sort");

    const where = {};

    if (search) {
      where.OR = [
        { city: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type && type.toLowerCase() !== "todos") {
      where.type = { equals: type, mode: "insensitive" };
    }

    if (guests) {
      const guestsNum = parseInt(guests, 10);
      if (!isNaN(guestsNum) && guestsNum > 0) {
        where.guests = { gte: guestsNum };
      }
    }

    let orderBy = { id: "asc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };
    if (sort === "rating-desc") orderBy = { rating: "desc" };

    const properties = await prisma.property.findMany({
      where,
      orderBy,
    });

    return NextResponse.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, city, type, guests, price, rating, image } = body;

    if (!title || !city || !type || !price) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos requeridos faltantes: title, city, type, price",
        },
        { status: 400 }
      );
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        city,
        type,
        guests: Number(guests) || 1,
        price: Number(price),
        rating: Number(rating) || 5.0,
        image:
          image ||
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      },
    });

    return NextResponse.json(
      { success: true, data: newProperty },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
