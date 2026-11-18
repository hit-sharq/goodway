'use client'

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  Crosshair,
  Filter,
  Globe2,
  Heart,
  LocateFixed,
  Map,
  MapPin,
  Menu,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Utensils,
  Footprints,
  X,
} from 'lucide-react'

type Place = {
  id: string
  name: string
  category: string
  rating: string
  reviews: number
  distance: string
  walk: string
  address: string
  image: string
  color: string
  badge?: string | null
  description: string
  entry: string
  landmark: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

type Category = {
  id: string
  name: string
  label: string
  icon: string
  places?: { _count: { places: number } }
}

const CATEGORY_ICONS: Record<string, any> = {
  Compass,
  Utensils,
  Bookmark,
  Heart,
  Sparkles,
}

export function DiscoveryExperience() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Everything')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [mobileMap, setMobileMap] = useState(false)
  const [location, setLocation] = useState('Soho, London')
  const [menuOpen, setMenuOpen] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [placesRes, categoriesRes] = await Promise.all([
          fetch('/api/places'),
          fetch('/api/categories'),
        ])
        const placesData = await placesRes.json()
        const categoriesData = await categoriesRes.json()
        if (!cancelled) {
          setPlaces(placesData)
          setCategories(categoriesData)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load data', error)
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    async function loadSaved() {
      try {
        const res = await fetch('/api/saved')
        const saved = await res.json()
        setSavedPlaceIds(new Set(saved.map((p: Place) => p.id)))
      } catch {
        // ignore
      }
    }

    loadSaved()
  }, [userId])

  async function toggleSave(placeId: string) {
    if (!userId) {
      signIn('credentials', { callbackUrl: window.location.pathname, redirect: false })
      return
    }

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId }),
      })
      const data = await res.json()

      setSavedPlaceIds((prev) => {
        const next = new Set(prev)
        if (data.saved) next.add(placeId)
        else next.delete(placeId)
        return next
      })
    } catch {
      // ignore
    }
  }

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesQuery = `${place.name} ${place.category} ${place.address} ${place.landmark}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const categoryMatch =
        activeCategory === 'Everything' ||
        (activeCategory === 'Shopping' && place.category === 'Independent design') ||
        (activeCategory === 'Wellness' && place.category === 'Beauty & wellness') ||
        (activeCategory === 'Culture' && place.category === 'Books & culture') ||
        place.category === activeCategory
      return matchesQuery && categoryMatch
    })
  }, [places, query, activeCategory])

  function submitSearch(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.currentTarget.blur()
    }
  }

  if (loading) {
    return (
      <main className="wayfinder-app">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse rounded-full h-8 w-8 bg-muted" />
        </div>
      </main>
    )
  }

  return (
    <main className="wayfinder-app">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Goodway home">
          <span className="brand-symbol"><Compass size={21} strokeWidth={2.2} /></span>
          <span>goodway<span className="wordmark-period">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="nav-active" href="#explore">Explore</a>
          <a href="#how-it-works">How it works</a>
          <a href="#business">For businesses</a>
        </nav>
        <div className="topbar-actions">
          <button className="language-button" aria-label="Choose language">
            <Globe2 size={16} /><span>EN</span><ChevronDown size={13} />
          </button>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">{session.user.name}</span>
              <button onClick={() => signOut()} className="sign-in-button">Sign out</button>
            </div>
          ) : (
            <button className="sign-in-button" onClick={() => signIn()}>Sign in</button>
          )}
          <a href="/submit" className="list-business-button">
            List your business <ArrowRight size={15} />
          </a>
        </div>
        <button
          className="mobile-menu-button icon-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <a href="#explore" onClick={() => setMenuOpen(false)}>Explore</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#business" onClick={() => setMenuOpen(false)}>For businesses</a>
            {session ? (
              <button onClick={() => { setMenuOpen(false); signOut() }}>Sign out</button>
            ) : (
              <button onClick={() => { setMenuOpen(false); signIn() }}>Sign in</button>
            )}
          </nav>
        )}
      </header>

      <section className="intro-section" id="home">
        <div className="intro-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> GOOD PLACES, FOUND</div>
          <h1>The world is closer<br className="desktop-break" /> than you <em>think.</em></h1>
          <p>Find the places worth finding. And the little details that actually get you there.</p>
        </div>
        <div className="intro-stamp">
          <span className="stamp-top">MADE FOR THE</span>
          <span className="stamp-main">last<br />100m</span>
          <span className="stamp-bottom">& EVERYWHERE BEFORE IT</span>
          <ArrowDownRight className="stamp-arrow" size={17} />
        </div>
      </section>

      <section className="search-panel" id="explore" aria-label="Find a local business">
        <div className="search-field-wrap">
          <Search className="search-icon" size={20} />
          <input
            aria-label="Search businesses, places, or neighborhoods"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={submitSearch}
            placeholder="Try “coffee”, “a good bookshop”…"
          />
          <kbd>⌘ K</kbd>
        </div>
        <div className="search-divider" />
        <button className="search-submit" onClick={() => setQuery((current) => current.trim())}>
          <Search size={17} /><span>Find a place</span>
        </button>
      </section>

      <section className="discover-section">
        <div className="discover-heading">
          <div>
            <div className="section-kicker">A NEIGHBORHOOD, WELL SPENT</div>
            <h2>Find your kind of <em>local.</em></h2>
          </div>
          <button className="area-button" onClick={() => setLocation(location === 'Soho, London' ? 'Shoreditch, London' : 'Soho, London')}>
            <Crosshair size={15} /> <span>{location}</span><ChevronRight size={14} />
          </button>
        </div>
        <div className="category-row" role="group" aria-label="Filter by category">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon]
            return (
              <button
                key={cat.id}
                className={`category-chip ${activeCategory === cat.label ? 'chip-active' : ''}`}
                onClick={() => setActiveCategory(cat.label)}
                aria-pressed={activeCategory === cat.label}
              >
                {Icon && <Icon size={15} />}
                {cat.label}
              </button>
            )
          })}
          <button className="filter-button" onClick={() => setActiveCategory(activeCategory === 'Everything' ? 'Culture' : 'Everything')}>
            <SlidersHorizontal size={15} /><span>Filters</span>
          </button>
        </div>

        <div className="results-layout">
          <div className={`results-column ${mobileMap ? 'mobile-hidden' : ''}`}>
            <div className="results-toolbar">
              <span>
                <strong>{filteredPlaces.length} good places</strong>
                <span className="results-in">in {location}</span>
              </span>
              <button className="sort-button" onClick={() => setShowAll((value) => !value)}>
                <span>Curated for you</span><ChevronDown size={14} />
              </button>
            </div>
            <div className="place-list">
              {filteredPlaces.slice(0, showAll ? filteredPlaces.length : 3).map((place) => (
                <PlaceCard key={place.id} place={place} onSelect={setSelectedPlace} isSelected={selectedPlace?.id === place.id} isSaved={savedPlaceIds.has(place.id)} onSave={toggleSave} />
              ))}
              {filteredPlaces.length === 0 && (
                <div className="empty-results">
                  <Search size={21} /><strong>No places found just yet</strong>
                  <span>Try a different name or category.</span>
                  <button onClick={() => { setQuery(''); setActiveCategory('Everything') }}>Clear search</button>
                </div>
              )}
            </div>
            {filteredPlaces.length > 0 && (
              <button className="more-places" onClick={() => setShowAll((value) => !value)}>
                {showAll ? 'Show fewer places' : 'Explore all places'} <ArrowRight size={15} />
              </button>
            )}
          </div>

          <div className={`map-column ${mobileMap ? 'mobile-visible' : ''}`}>
            <div className="map-toolbar">
              <div className="map-toolbar-title">
                <span className="live-dot" /><strong>{location}</strong>
                <span className="map-count">{filteredPlaces.length} places</span>
              </div>
              <button className="map-control" aria-label="Map filters" onClick={() => setActiveCategory(activeCategory === 'Everything' ? 'Wellness' : 'Everything')}>
                <Filter size={15} />
              </button>
            </div>
            <MapArtwork selected={selectedPlace?.id ?? null} places={filteredPlaces} />
            <button className="map-locate" aria-label="Center map on me" onClick={() => setLocation('Near me')}>
              <LocateFixed size={17} />
            </button>
            <div className="map-footer">
              <span><span className="legend-dot" /><span>Business-verified entrances</span></span>
              <button onClick={() => setSelectedPlace(places[0] ?? null)}>How it works <ArrowUpRight size={13} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" id="how-it-works">
        <div className="trust-item">
          <span className="trust-icon"><MapPin size={17} /></span>
          <span><strong>Not just a pin</strong><small>Find the right door, every time.</small></span>
        </div>
        <span className="trust-separator" />
        <div className="trust-item">
          <span className="trust-icon"><Check size={17} /></span>
          <span><strong>Checked by locals</strong><small>Real details from the people there.</small></span>
        </div>
        <span className="trust-separator" />
        <div className="trust-item">
          <span className="trust-icon"><Globe2 size={17} /></span>
          <span><strong>Made for everywhere</strong><small>One good find at a time.</small></span>
        </div>
        <a className="trust-cta" id="business" href="mailto:hello@goodway.example">
          Own a good place? <ArrowRight size={15} />
        </a>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="#home">goodway<span>.</span></a>
        <span>Find the door. Find your people.</span>
        <div>
          <a href="#how-it-works">About</a>
          <a href="/submit">For businesses</a>
          <a href="/saved">
            {savedPlaceIds.size > 0 ? `Saved places (${savedPlaceIds.size})` : 'Save a place'}
            <Bookmark size={13} />
          </a>
        </div>
      </footer>

      <nav className="mobile-tabbar" aria-label="Mobile tabs">
        <button className={!mobileMap ? 'tab-active' : ''} onClick={() => setMobileMap(false)}>
          <Search size={19} /><span>Explore</span>
        </button>
        <button className={mobileMap ? 'tab-active' : ''} onClick={() => setMobileMap(true)}>
          <Map size={19} /><span>Map</span>
        </button>
        <a href="/saved">
          <Heart size={19} /><span>Saved</span>
        </a>
      </nav>
      {selectedPlace && <DetailPanel place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
    </main>
  )
}

function MapArtwork({ selected, places }: { selected: string | null; places: Place[] }) {
  const markerIcons: Record<string, any> = {
    cafe: Utensils,
    shop: Bookmark,
    wellness: Heart,
    books: Sparkles,
  }

  const placeMarkers = places.map((place) => {
    const iconKey = place.category.toLowerCase().includes('coffee') ? 'cafe' : place.category.toLowerCase().includes('design') || place.category.toLowerCase().includes('shop') ? 'shop' : place.category.toLowerCase().includes('wellness') || place.category.toLowerCase().includes('beauty') ? 'wellness' : 'books'
    const Icon = markerIcons[iconKey] || Sparkles
    const className = `map-marker marker-${iconKey} ${selected === place.id ? 'is-active' : ''}`
    return (
      <button
        key={place.id}
        className={className}
        aria-label={`${place.name}, ${place.walk}`}
        onClick={() => {}}
      >
        <span className="marker-icon"><Icon size={16} /></span>
      </button>
    )
  })

  return (
    <div className="map-art" role="img" aria-label="Illustrated neighborhood map showing local businesses around Soho, London">
      <div className="map-wash" />
      <svg className="map-streets" viewBox="0 0 760 680" preserveAspectRatio="none" aria-hidden="true">
        <path className="street street-major" d="M-40 125 C110 175 190 145 315 180 S520 217 820 105" />
        <path className="street street-major" d="M120 -35 C145 95 205 195 265 275 S360 445 360 735" />
        <path className="street" d="M-30 340 C90 290 175 315 255 353 S490 398 805 314" />
        <path className="street" d="M-30 475 C120 450 195 478 315 490 S540 508 805 450" />
        <path className="street" d="M475 -30 C440 102 453 223 490 310 S553 473 600 720" />
        <path className="street" d="M-30 225 C100 250 195 228 290 245 S530 265 810 190" />
        <path className="street" d="M65 -20 C95 110 88 216 119 317 S165 507 135 710" />
        <path className="street" d="M-20 560 C152 535 214 557 355 575 S568 605 785 545" />
        <path className="street fine" d="M207 0 C230 112 266 190 330 273 S425 415 444 680" />
        <path className="street fine" d="M625 0 C580 125 590 235 635 355 S697 555 738 680" />
        <path className="street fine" d="M-20 85 C144 124 270 94 393 131 S624 158 790 65" />
        <path className="street fine" d="M-15 620 C148 597 254 635 390 645 S602 676 780 620" />
      </svg>
      <div className="map-park park-one"><span>Golden Square</span></div>
      <div className="map-park park-two" />
      <span className="map-label label-soho">SOHO</span>
      <span className="map-label label-carnaby">CARNABY ST</span>
      <span className="map-label label-liberty">LIBERTY</span>
      <span className="map-label label-regent">REGENT ST</span>
      <span className="map-label label-berwick">BERWICK ST</span>
      <span className="map-label label-oxford">OXFORD ST</span>
      <div className="map-route" />
      {placeMarkers}
      <div className="you-are-here"><span /><span className="sr-only">You are here</span></div>
      <div className="map-scale"><span>100 m</span><i /></div>
      <div className="map-attribution">Map data © OpenStreetMap contributors</div>
    </div>
  )
}

function PlaceCard({ place, onSelect, isSelected, isSaved, onSave }: { place: Place; onSelect: (place: Place) => void; isSelected: boolean; isSaved?: boolean; onSave?: (placeId: string) => void }) {
  return (
    <button className={`place-card ${isSelected ? 'place-card-selected' : ''}`} onClick={() => onSelect(place)} aria-pressed={isSelected}>
      <span className="place-image-wrap">
        <img className="place-image" src={place.image} alt={`${place.name} interior`} loading="lazy" />
        {place.badge && <span className={`place-badge ${place.color === 'sage' ? 'badge-green' : 'badge-neutral'}`}>{place.badge}</span>}
        <span className="place-walk"><Footprints size={12} /> {place.walk}</span>
        <button onClick={(e) => { e.stopPropagation(); onSave?.(place.id) }} className={`place-save-btn ${isSaved ? 'place-saved' : ''}`} aria-label={isSaved ? 'Unsave place' : 'Save place'}>
          <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} stroke={isSaved ? 'none' : 'currentColor'} />
        </button>
      </span>
      <span className="place-content">
        <span className="place-topline">
          <span className="place-name">{place.name}</span>
          <span className="place-rating"><Star size={13} fill="currentColor" /> {place.rating}</span>
        </span>
        <span className="place-category">{place.category} <span className="dot-separator">·</span> {place.distance}</span>
        <span className="place-address"><MapPin size={13} /> {place.address}</span>
        <span className="place-entry"><span className="entry-check"><Check size={11} /></span> {place.landmark}</span>
      </span>
    </button>
  )
}

function DetailPanel({ place, onClose }: { place: Place; onClose: () => void }) {
  return (
    <div className="detail-backdrop" onClick={onClose} role="presentation">
      <section className="detail-sheet" onClick={(event) => event.stopPropagation()} aria-labelledby="detail-title" role="dialog" aria-modal="true">
        <button className="detail-close icon-button" onClick={onClose} aria-label="Close business details"><X size={20} /></button>
        <img className="detail-image" src={place.image} alt={`${place.name} interior`} />
        <div className="detail-body">
          <div className="detail-kicker"><span className="detail-kicker-dot" /> {place.category} <span>·</span> <Star size={13} fill="currentColor" /> {place.rating} ({place.reviews} reviews)</div>
          <h2 id="detail-title">{place.name}</h2>
          <p className="detail-description">{place.description}</p>
          <div className="detail-address"><MapPin size={17} /><span>{place.address}<small>Soho, London W1</small></span><button className="copy-address" aria-label="Save address"><Bookmark size={17} /></button></div>
          <div className="arrival-card">
            <div className="arrival-heading"><span className="arrival-icon"><LocateFixed size={17} /></span><div><strong>When you get close</strong><span>Business-verified directions</span></div><span className="verified-pill"><Check size={11} /> Verified</span></div>
            <p>{place.entry}</p>
            <div className="arrival-landmark"><MapPin size={14} /> {place.landmark}</div>
          </div>
          <div className="detail-meta"><span><Clock3 size={15} /> Open today · until 6 pm</span><span><Footprints size={15} /> {place.walk}</span></div>
          <button className="directions-button"><Navigation size={17} fill="currentColor" /> Get directions <ArrowRight size={17} /></button>
          <p className="directions-note">Opens walking directions in your maps app</p>
        </div>
      </section>
    </div>
  )
}
