import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const location = searchParams.get("location") ?? ""

  const places = await prisma.place.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
                { address: { contains: query, mode: "insensitive" } },
                { landmark: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    },
    include: { categoryRef: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(places)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const user = await (await import("@/lib/auth")).getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const place = await prisma.place.create({
      data: {
        name: body.name,
        category: body.category,
        categoryId: body.categoryId ?? null,
        rating: body.rating,
        reviews: body.reviews ?? 0,
        distance: body.distance,
        walk: body.walk,
        address: body.address,
        image: body.image,
        color: body.color,
        badge: body.badge ?? null,
        description: body.description,
        entry: body.entry,
        landmark: body.landmark,
        isVerified: body.isVerified ?? false,
      },
      include: { categoryRef: true },
    })

    return NextResponse.json(place, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create place" }, { status: 400 })
  }
}
