import { prisma } from "../../../lib/prisma";
import { getDaysUntilExpiry } from "../../../utils/status";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const foodItems = await prisma.foodItem.findMany({
      include: { category: true }
    });

    const itemsWithDays = foodItems.map(item => ({
      ...item,
      daysUntilExpiry: getDaysUntilExpiry(item.expiryDate)
    }));

    const expired = itemsWithDays.filter(item => item.daysUntilExpiry < 0);
    const expiringSoon = itemsWithDays.filter(item => item.daysUntilExpiry >= 0 && item.daysUntilExpiry <= 7);
    const fresh = itemsWithDays.filter(item => item.daysUntilExpiry > 7);

    const suggestions = [];

    if (expired.length > 0) {
      suggestions.push({
        type: "urgent",
        message: `You have ${expired.length} expired item(s). Consider composting or disposing them immediately.`,
        action: "Remove expired items"
      });
    }

    if (expiringSoon.length > 0) {
      const urgentItems = expiringSoon.filter(item => item.daysUntilExpiry <= 3);
      if (urgentItems.length > 0) {
        suggestions.push({
          type: "warning",
          message: `${urgentItems.length} item(s) expiring in 3 days or less. Plan meals around these items.`,
          action: "View expiring items",
          items: urgentItems.map(item => item.name)
        });
      }

      const dairyItems = expiringSoon.filter(item => 
        item.category.name.toLowerCase().includes('dairy')
      );
      if (dairyItems.length > 0) {
        suggestions.push({
          type: "tip",
          message: "Use expiring dairy products in smoothies, baking, or make yogurt-based dips.",
          action: "Get dairy recipes"
        });
      }

      const vegetableItems = expiringSoon.filter(item => 
        item.category.name.toLowerCase().includes('vegetable')
      );
      if (vegetableItems.length > 0) {
        suggestions.push({
          type: "tip",
          message: "Consider making a vegetable stir-fry or soup with your expiring vegetables.",
          action: "Get vegetable recipes"
        });
      }
    }

    if (fresh.length > 0 && expiringSoon.length === 0) {
      suggestions.push({
        type: "success",
        message: "Great job! All your items are fresh. Consider meal planning to maintain this status.",
        action: "Plan meals"
      });
    }

    if (foodItems.length === 0) {
      suggestions.push({
        type: "info",
        message: "Start building your inventory by adding your first food items.",
        action: "Add items"
      });
    }

    const defaultSuggestions = [
      {
        type: "tip",
        message: "Store fruits and vegetables in the refrigerator to extend their shelf life.",
        action: "Storage tips"
      },
      {
        type: "tip",
        message: "Check your inventory weekly to avoid food waste and save money.",
        action: "Set reminder"
      },
      {
        type: "tip",
        message: "Consider buying smaller quantities of perishable items to reduce waste.",
        action: "Shopping tips"
      }
    ];

    const finalSuggestions = suggestions.length > 0 
      ? suggestions.slice(0, 3)
      : defaultSuggestions.slice(0, 3);

    res.status(200).json({
      suggestions: finalSuggestions,
      summary: {
        totalItems: foodItems.length,
        expiredCount: expired.length,
        expiringSoonCount: expiringSoon.length,
        freshCount: fresh.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
}
