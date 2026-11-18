import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      categoryRef: true,
      suggestions: {
        where: { status: "approved" },
        include: { suggestedByRef: { select: { name: true } } },
      },
      owner: true,
    },
  })

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 })
  }

  return NextResponse.json(place)
}
