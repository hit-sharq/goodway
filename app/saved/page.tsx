import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Star, Heart, MapPin, Clock3 } from "lucide-react"

export default async function SavedPage() {
  const user = await getCurrentUser()
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view saved places.</p>
      </div>
    )
  }

  const savedPlaces = await prisma.savedPlace.findMany({
    where: { userId: user.id },
    include: { place: { include: { categoryRef: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">← Back to explore</span>
            </a>
            <h1 className="text-xl font-semibold">Saved places</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedPlaces.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No saved places yet</h3>
            <p className="text-muted-foreground">Save places you love to find them easily later.</p>
            <a href="/" className="text-primary hover:underline mt-4 inline-block">
              Start exploring
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlaces.map(({ place }) => (
              <article key={place.id} className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-medium text-muted-foreground">{place.rating}</span>
                </div>
                <img
                  src={place.image}
                  alt={place.name}
                  className="aspect-video w-full rounded-xl object-cover mb-4"
                />
                <h3 className="font-semibold">{place.name}</h3>
                <p className="text-sm text-muted-foreground">{place.category}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{place.address}</span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="h-3 w-3" />
                  <span>{place.walk}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
