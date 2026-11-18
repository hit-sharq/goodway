import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { MapPin, Star, Clock3, Footprints, Bookmark, Navigation, ArrowRight, Check } from "lucide-react"

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      categoryRef: true,
      owner: true,
      suggestions: {
        where: { status: "approved" },
        include: { suggestedByRef: { select: { name: true } } },
      },
      _count: { select: { saves: true } },
    },
  })

  if (!place) {
    notFound()
  }

  const isSaved = session?.user?.id
    ? await prisma.savedPlace.findUnique({
        where: {
          userId_placeId: { userId: session.user.id, placeId: place.id },
        },
      })
    : null

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">{place.name}</h1>
            </div>
            <a href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to explore
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img
                src={place.image}
                alt={place.name}
                className="object-cover w-full h-full"
                loading="eager"
              />
              {place.badge && (
                <div className="absolute top-4 left-4 rounded-lg bg-white px-3 py-1 text-xs font-medium shadow-md">
                  {place.badge}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{place.rating}</span>
                    <span>({place.reviews} reviews)</span>
                    {place.categoryRef && (
                      <span className="ml-2">· {place.categoryRef.label}</span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">{place.name}</h2>
                  <p className="text-muted-foreground">{place.description}</p>
                </div>
                <div className="flex flex-col items-end lg:items-start gap-4">
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Navigation className="h-4 w-4" /> Get directions
                  </button>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-2 rounded-lg border bg-input px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                  >
                    <Bookmark className="h-4 w-4" />
                    {isSaved ? "Saved" : "Save place"}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Address</p>
                      <p className="text-sm text-muted-foreground">{place.address}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-start gap-3">
                    <Clock3 className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Hours</p>
                      <p className="text-sm text-muted-foreground">Open today · until 6 pm</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-start gap-3">
                    <Footprints className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Walking time</p>
                      <p className="text-sm text-muted-foreground">{place.walk}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Entrance verified</p>
                      <p className="text-sm text-muted-foreground">
                        {place.isVerified ? "Business-verified" : "Community-submitted"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-sm font-semibold mb-4">When you get close</h3>
                <p className="text-muted-foreground">{place.entry}</p>
                {place.landmark && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold">Landmark</p>
                    <p className="text-sm text-muted-foreground">{place.landmark}</p>
                  </div>
                )}
              </div>

              {place.suggestions.length > 0 && (
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-sm font-semibold mb-4">Community corrections</h3>
                  <ul className="space-y-3">
                    {place.suggestions.map((s) => (
                      <li key={s.id} className="text-sm text-muted-foreground">
                        <strong>{s.field}:</strong> {s.newValue}{" "}
                        <span className="text-xs text-primary ml-2">suggested by {s.suggestedByRef?.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-lg border bg-card p-6 sticky top-24">
              <h3 className="text-sm font-semibold mb-4">Business owner?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Claim this place to update entry instructions, photos, and hours.
              </p>
              <button className="w-full rounded-lg border border-dashed bg-input px-4 py-3 text-sm text-muted-foreground hover:bg-accent">
                Claim business
              </button>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-semibold mb-4">Suggest a correction</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Help keep this entrance info accurate.
              </p>
              <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Suggest edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
