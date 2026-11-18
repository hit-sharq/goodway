import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 409 })
    }

    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return Response.json({ id: user.id, email: user.email, name: user.name }, { status: 201 })
  } catch {
    return Response.json({ error: "Registration failed" }, { status: 500 })
  }
}
