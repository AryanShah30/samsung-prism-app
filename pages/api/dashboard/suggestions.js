import { prisma } from "../../../lib/prisma";
import { getDaysUntilExpiry } from "../../../utils/status";
import { EXPIRY_THRESHOLDS } from "../../../utils/config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const foodItems = await prisma.foodItem.findMany({
      include: { category: true },
    });

    const itemsWithDays = foodItems.map((item) => ({
      ...item,
      daysUntilExpiry: getDaysUntilExpiry(item.expiryDate),
    }));

    const expired = itemsWithDays.filter((item) => item.daysUntilExpiry < 0);
    const expiringSoon = itemsWithDays.filter(
      (item) =>
        item.daysUntilExpiry >= 0 &&
        item.daysUntilExpiry <= EXPIRY_THRESHOLDS.SOON_DAYS
    );
    const fresh = itemsWithDays.filter(
      (item) => item.daysUntilExpiry > EXPIRY_THRESHOLDS.SOON_DAYS
    );

    const suggestions = [];

    if (expired.length > 0) {
      suggestions.push({
        type: "urgent",
        title: "Expired Items Alert",
        message: `You have ${expired.length} expired item(s) that need immediate attention.`,
        action: "Remove expired items",
        items: expired
          .slice(0, 3)
          .map((item) => `${item.name} (${item.category.name})`),
      });
    }

    if (expiringSoon.length > 0) {
      const urgentItems = expiringSoon.filter(
        (item) => item.daysUntilExpiry <= EXPIRY_THRESHOLDS.URGENT_DAYS
      );
      if (urgentItems.length > 0) {
        suggestions.push({
          type: "warning",
          title: "Use These Items Today",
          message: `${urgentItems.length} item(s) expiring in ${EXPIRY_THRESHOLDS.URGENT_DAYS} days or less.`,
          action: "View expiring items",
          items: urgentItems
            .slice(0, 3)
            .map((item) => `${item.name} (${item.daysUntilExpiry} days left)`),
        });
      }

      const dairyItems = expiringSoon.filter(
        (item) =>
          item.category.name.toLowerCase().includes("dairy") ||
          item.category.name.toLowerCase().includes("milk") ||
          item.category.name.toLowerCase().includes("cheese")
      );
      if (dairyItems.length > 0) {
        suggestions.push({
          type: "recipe",
          title: "Dairy Recipe Ideas",
          message: `Use your expiring dairy items to make delicious recipes.`,
          action: "Get dairy recipes",
          items: dairyItems
            .slice(0, 3)
            .map(
              (item) =>
                `${item.name} - Make smoothies, pancakes, or cheese sauce`
            ),
        });
      }

      const vegetableItems = expiringSoon.filter(
        (item) =>
          item.category.name.toLowerCase().includes("vegetable") ||
          item.category.name.toLowerCase().includes("produce")
      );
      if (vegetableItems.length > 0) {
        suggestions.push({
          type: "recipe",
          title: "Vegetable Recipe Ideas",
          message: `Transform your expiring vegetables into tasty meals.`,
          action: "Get vegetable recipes",
          items: vegetableItems
            .slice(0, 3)
            .map(
              (item) =>
                `${item.name} - Make stir-fry, soup, or roasted vegetables`
            ),
        });
      }

      const fruitItems = expiringSoon.filter((item) =>
        item.category.name.toLowerCase().includes("fruit")
      );
      if (fruitItems.length > 0) {
        suggestions.push({
          type: "recipe",
          title: "Fruit Recipe Ideas",
          message: `Don't let your fruits go to waste! Make something sweet.`,
          action: "Get fruit recipes",
          items: fruitItems
            .slice(0, 3)
            .map(
              (item) =>
                `${item.name} - Make smoothies, fruit salad, or baked goods`
            ),
        });
      }
    }

    if (fresh.length > 0 && expiringSoon.length === 0) {
      suggestions.push({
        type: "success",
        message:
          "Great job! All your items are fresh. Consider meal planning to maintain this status.",
        action: "Plan meals",
      });
    }

    if (foodItems.length === 0) {
      suggestions.push({
        type: "info",
        message:
          "Start building your inventory by adding your first food items.",
        action: "Add items",
      });
    }

    const defaultSuggestions = [
      {
        type: "tip",
        title: "Storage Tips",
        message:
          "Store fruits and vegetables in the refrigerator to extend their shelf life by 2-3 days.",
        action: "Learn storage tips",
        items: [
          "Keep bananas separate from other fruits",
          "Store leafy greens in damp paper towels",
          "Keep potatoes in cool, dark places",
        ],
      },
      {
        type: "tip",
        title: "Weekly Check",
        message:
          "Check your inventory weekly to avoid food waste and save money on groceries.",
        action: "Set reminder",
        items: [
          "Set a weekly reminder every Sunday",
          "Check expiration dates before shopping",
          "Plan meals around expiring items",
        ],
      },
      {
        type: "tip",
        title: "Smart Shopping",
        message:
          "Buy smaller quantities of perishable items to reduce waste and always have fresh food.",
        action: "Shopping tips",
        items: [
          "Buy only what you need for 3-4 days",
          "Check your inventory before shopping",
          "Consider frozen alternatives for longer storage",
        ],
      },
    ];

    const finalSuggestions =
      suggestions.length > 0
        ? suggestions.slice(0, 3)
        : defaultSuggestions.slice(0, 3);

    res.status(200).json({
      suggestions: finalSuggestions,
      summary: {
        totalItems: foodItems.length,
        expiredCount: expired.length,
        expiringSoonCount: expiringSoon.length,
        freshCount: fresh.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
}
