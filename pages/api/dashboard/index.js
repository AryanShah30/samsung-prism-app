import { prisma } from "../../../lib/prisma";
import { EXPIRY_THRESHOLDS } from "../../../utils/config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const foodItems = await prisma.foodItem.findMany({
      include: { category: true },
    });

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    const expired = foodItems.filter((item) => item.daysUntilExpiry < 0);
    const expiringSoon = foodItems.filter(
      (item) =>
        item.daysUntilExpiry >= 0 &&
        item.daysUntilExpiry <= EXPIRY_THRESHOLDS.SOON_DAYS
    );
    const fresh = foodItems.filter(
      (item) => item.daysUntilExpiry > EXPIRY_THRESHOLDS.SOON_DAYS
    );

    const recentlyExpired = expired
      .sort((a, b) => Math.abs(a.daysUntilExpiry) - Math.abs(b.daysUntilExpiry))
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category.name,
        daysAgo: Math.abs(item.daysUntilExpiry),
        expiryDate: item.expiryDate,
      }));

    const expiringSoonList = expiringSoon
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category.name,
        daysLeft: item.daysUntilExpiry,
        expiryDate: item.expiryDate,
      }));

    const dashboard = {
      keyMetrics: {
        totalItems: foodItems.length,
        expiringSoon: expiringSoon.length,
        expiredItems: expired.length,
      },

      expiringSoon: expiringSoonList,
      recentlyExpired: recentlyExpired,

      wasteTrend: {
        message: "Bar graph will be implemented in future version",
        placeholder: true,
      },

      aiSuggestions: [
        {
          type: "tip",
          message: "Use expiring milk in smoothies or baking",
          action: "Get recipes",
        },
        {
          type: "tip",
          message: "Consider freezing fresh vegetables to extend shelf life",
          action: "Storage tips",
        },
        {
          type: "tip",
          message: "Plan meals around items expiring soon to reduce waste",
          action: "Meal planning",
        },
      ],

      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        itemCount: cat._count.items,
      })),

      recentItems: foodItems
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category.name,
          dateAdded: item.dateAdded,
          daysUntilExpiry: item.daysUntilExpiry,
        })),
    };

    res.status(200).json(dashboard);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
}
