import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await (await import("@/lib/auth")).getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { placeId, field, oldValue, newValue } = await request.json()

  try {
    const suggestion = await prisma.placeSuggestion.create({
      data: {
        placeId,
        field,
        oldValue,
        newValue,
        suggestedBy: user.id,
      },
    })

    return NextResponse.json(suggestion, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create suggestion" }, { status: 400 })
  }
}
