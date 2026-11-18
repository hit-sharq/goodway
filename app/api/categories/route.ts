import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { places: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const category = await prisma.category.create({
      data: {
        name: body.name,
        label: body.label,
        icon: body.icon,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 400 })
  }
}
