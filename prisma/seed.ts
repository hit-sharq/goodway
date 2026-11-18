import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: 'everything', label: 'Everything', icon: 'Compass' },
    { name: 'coffee-brunch', label: 'Coffee & brunch', icon: 'Utensils' },
    { name: 'shopping', label: 'Shopping', icon: 'Bookmark' },
    { name: 'wellness', label: 'Wellness', icon: 'Heart' },
    { name: 'culture', label: 'Culture', icon: 'Sparkles' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }

  const everything = await prisma.category.findUnique({ where: { name: 'everything' } })
  const coffee = await prisma.category.findUnique({ where: { name: 'coffee-brunch' } })
  const shopping = await prisma.category.findUnique({ where: { name: 'shopping' } })
  const wellness = await prisma.category.findUnique({ where: { name: 'wellness' } })
  const culture = await prisma.category.findUnique({ where: { name: 'culture' } })

  const places = [
    {
      name: 'The Corner House',
      category: 'Coffee & brunch',
      categoryId: coffee?.id,
      rating: '4.9',
      reviews: 284,
      distance: '0.2 mi',
      walk: '4 min walk',
      address: '14 Newburgh Street, Soho',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=760&q=85',
      color: 'sage',
      badge: 'Local favorite',
      description: 'A little corner of calm in the middle of everything. Come for the flat white, stay for the cardamom buns.',
      entry: 'Look for the forest-green door beneath the striped awning. The entrance is on Newburgh Street, just past the bookshop.',
      landmark: 'Opposite the Liberty side entrance',
      isVerified: true,
    },
    {
      name: 'Form & Field',
      category: 'Independent design',
      categoryId: shopping?.id,
      rating: '4.8',
      reviews: 132,
      distance: '0.3 mi',
      walk: '6 min walk',
      address: '22 Carnaby Street, Soho',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=760&q=85',
      color: 'clay',
      badge: 'Easy to find',
      description: 'Thoughtful objects for everyday life, made by people who care about how things are made.',
      entry: 'Enter through the arched glass doorway on Carnaby Street. The shop is all on the ground floor.',
      landmark: 'Three doors north of Kingly Court',
      isVerified: true,
    },
    {
      name: 'Studio Lune',
      category: 'Beauty & wellness',
      categoryId: wellness?.id,
      rating: '4.9',
      reviews: 96,
      distance: '0.4 mi',
      walk: '8 min walk',
      address: '3 Kingly Court, Soho',
      image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=760&q=85',
      color: 'lavender',
      description: 'A neighborhood studio for slower mornings, considered treatments, and feeling like yourself again.',
      entry: 'Come into Kingly Court from Carnaby Street and head to the first-floor balcony. We\'re the last door on your left.',
      landmark: 'Above the central courtyard',
      isVerified: true,
    },
    {
      name: 'Little Bird Books',
      category: 'Books & culture',
      categoryId: culture?.id,
      rating: '4.7',
      reviews: 88,
      distance: '0.5 mi',
      walk: '9 min walk',
      address: '9 Berwick Street, Soho',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=760&q=85',
      color: 'butter',
      description: 'An independent bookshop for curious minds, with a well-loved window seat and a very good poetry shelf.',
      entry: 'The blue shopfront is halfway down Berwick Street. Step up once from the pavement; staff can help with access.',
      landmark: 'Across from the market fruit stall',
      isVerified: true,
    },
  ]

  for (const place of places) {
    await prisma.place.upsert({
      where: { name: place.name },
      update: {},
      create: place,
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
