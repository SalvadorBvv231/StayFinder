import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Alojamiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.guests !== undefined && { guests: Number(body.guests) }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.rating !== undefined && { rating: Number(body.rating) }),
        ...(body.image !== undefined && { image: body.image }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    return NextResponse.json({
      success: true,
      message: `Alojamiento con ID ${id} eliminado con éxito`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
