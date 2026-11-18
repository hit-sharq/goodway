import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await (await import("@/lib/auth")).getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get("placeId")

  if (placeId) {
    const saved = await prisma.savedPlace.findUnique({
      where: {
        userId_placeId: { userId: user.id, placeId },
      },
    })
    return NextResponse.json({ saved: !!saved })
  }

  const savedPlaces = await prisma.savedPlace.findMany({
    where: { userId: user.id },
    include: { place: { include: { categoryRef: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(savedPlaces.map((s) => s.place))
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

  const { placeId } = await request.json()

  try {
    const existing = await prisma.savedPlace.findUnique({
      where: {
        userId_placeId: { userId: user.id, placeId },
      },
    })

    if (existing) {
      await prisma.savedPlace.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ saved: false })
    }

    await prisma.savedPlace.create({
      data: { userId: user.id, placeId },
    })

    return NextResponse.json({ saved: true })
  } catch {
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 400 })
  }
}
