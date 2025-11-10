const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (safe because we'll reset DB before running seed)
  await prisma.foodItem.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Dairy' } }),
    prisma.category.create({ data: { name: 'Vegetables' } }),
    prisma.category.create({ data: { name: 'Meat' } }),
    prisma.category.create({ data: { name: 'Pantry' } }),
    prisma.category.create({ data: { name: 'Fruits' } }),
  ]);

  // Create sample items (quantity stored in `volume`, unit default 'g')
  const now = new Date();
  const items = [
    {
      name: 'Whole Milk',
      volume: 1000,
      volumeUnit: 'g',
      expiryDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 5,
      status: 'soon',
      notes: '2% fat',
      categoryId: categories[0].id,
    },
    {
      name: 'Carrots',
      volume: 500,
      volumeUnit: 'g',
      expiryDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 10,
      status: 'fresh',
      notes: '',
      categoryId: categories[1].id,
    },
    {
      name: 'Chicken Breast',
      volume: 800,
      volumeUnit: 'g',
      expiryDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 2,
      status: 'urgent',
      notes: 'Boneless',
      categoryId: categories[2].id,
    },
    {
      name: 'Rice (Basmati)',
      volume: 2000,
      volumeUnit: 'g',
      expiryDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 365,
      status: 'fresh',
      notes: 'Keep sealed',
      categoryId: categories[3].id,
    },
    {
      name: 'Apples',
      volume: 1200,
      volumeUnit: 'g',
      expiryDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 14,
      status: 'fresh',
      notes: 'Various',
      categoryId: categories[4].id,
    },
  ];

  await Promise.all(items.map((it) => prisma.foodItem.create({ data: it })));

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
