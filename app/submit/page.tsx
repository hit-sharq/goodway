'use client'

import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Utensils, Bookmark, Heart, Sparkles } from 'lucide-react'

const CATEGORY_OPTIONS = [
  { value: 'Coffee & brunch', label: 'Coffee & brunch', icon: Utensils },
  { value: 'Independent design', label: 'Shopping', icon: Bookmark },
  { value: 'Beauty & wellness', label: 'Wellness', icon: Heart },
  { value: 'Books & culture', label: 'Culture', icon: Sparkles },
]

type FormData = {
  name: string
  category: string
  rating: string
  reviews: string
  distance: string
  walk: string
  address: string
  image: string
  color: string
  badge: string
  description: string
  entry: string
  landmark: string
}

export default function SubmitPage() {
  const { userId } = useAuth()
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'Coffee & brunch',
    rating: '5.0',
    reviews: '0',
    distance: '',
    walk: '',
    address: '',
    image: '',
    color: 'sage',
    badge: '',
    description: '',
    entry: '',
    landmark: '',
  })

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to submit a business.</p>
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reviews: parseInt(formData.reviews) || 0,
          isVerified: false,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit business')
      }

      const place = await res.json()
      router.push(`/places/${place.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 rotate-180 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Back to explore</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg border bg-card p-8">
          <h1 className="text-2xl font-bold mb-2">List your business</h1>
          <p className="text-muted-foreground mb-6">
            Help people find the right door. Share verified entrance details for your place.
          </p>

          {error && (
            <div className="rounded-lg bg-destructive p-4 text-destructive-foreground mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Business name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Address</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 14 Newburgh Street, Soho"
                className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Entrance instructions</label>
              <textarea
                name="entry"
                required
                rows={4}
                value={formData.entry}
                onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                placeholder="e.g. Look for the green door beneath the striped awning..."
                className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Landmark (nearby reference)</label>
              <input
                name="landmark"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="e.g. Opposite the Liberty side entrance"
                className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Walking time</label>
                <input
                  type="text"
                  name="walk"
                  value={formData.walk}
                  onChange={(e) => setFormData({ ...formData, walk: e.target.value })}
                  placeholder="e.g. 4 min walk"
                  className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Rating</label>
                <input
                  type="text"
                  name="rating"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="e.g. 4.9"
                  className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Reviews</label>
                <input
                  type="text"
                  name="reviews"
                  value={formData.reviews}
                  onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell people what makes your place worth finding..."
                className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Badge (optional)</label>
              <input
                name="badge"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Local favorite"
                className="w-full rounded-lg border bg-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'List business'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
