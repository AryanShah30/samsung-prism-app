import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { days = 7 } = req.query;
    const daysThreshold = parseInt(days);

    if (isNaN(daysThreshold) || daysThreshold < 0) {
      return res.status(400).json({ error: "Invalid days parameter" });
    }

    const expiringItems = await prisma.foodItem.findMany({
      where: {
        daysUntilExpiry: {
          lte: daysThreshold
        }
      },
      include: { category: true },
      orderBy: { daysUntilExpiry: 'asc' }
    });

    const totalItems = await prisma.foodItem.count();
    const summary = {
      totalItems,
      expiringItems: expiringItems.length,
      expiredItems: expiringItems.filter(item => item.daysUntilExpiry < 0).length,
      urgentItems: expiringItems.filter(item => item.daysUntilExpiry <= 3).length,
      soonItems: expiringItems.filter(item => item.daysUntilExpiry > 3 && item.daysUntilExpiry <= 7).length
    };

    res.status(200).json({
      items: expiringItems,
      summary
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch expiring items" });
  }
}
