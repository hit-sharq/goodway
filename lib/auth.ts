import { auth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    const clerkClientInstance = await clerkClient()
    const clerkUser = await clerkClientInstance.users.getUser(userId)
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser.fullName ?? null,
        image: clerkUser.imageUrl ?? null,
      },
    })
  }

  return user
}
