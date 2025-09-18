import { prisma } from "../../../lib/prisma";
import { EXPIRY_THRESHOLDS } from "../../../utils/config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { days = EXPIRY_THRESHOLDS.SOON_DAYS } = req.query;
    const daysThreshold = parseInt(days);

    if (isNaN(daysThreshold) || daysThreshold < 0 || daysThreshold > 365) {
      return res.status(400).json({ error: "Invalid days parameter. Must be between 0 and 365" });
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
      urgentItems: expiringItems.filter(item => item.daysUntilExpiry <= EXPIRY_THRESHOLDS.URGENT_DAYS).length,
      soonItems: expiringItems.filter(item => item.daysUntilExpiry > EXPIRY_THRESHOLDS.URGENT_DAYS && item.daysUntilExpiry <= EXPIRY_THRESHOLDS.SOON_DAYS).length
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
