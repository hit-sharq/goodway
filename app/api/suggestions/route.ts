import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get("placeId")

  if (placeId) {
    const suggestions = await prisma.placeSuggestion.findMany({
      where: { placeId },
      include: { suggestedByRef: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(suggestions)
  }

  return NextResponse.json([])
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { placeId, field, oldValue, newValue } = await request.json()

  try {
    const suggestion = await prisma.placeSuggestion.create({
      data: {
        placeId,
        field,
        oldValue,
        newValue,
        suggestedBy: session.user.id,
      },
    })

    return NextResponse.json(suggestion, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create suggestion" }, { status: 400 })
  }
}
