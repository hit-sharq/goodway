import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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
