/**
 * Items collection endpoint (/api/items)
 *
 * Supported Methods:
 * GET  - List all food items with their category.
 * POST - Create a new food item; maps client `quantity`/`unit` -> DB `volume`/`volumeUnit`.
 *
 * Data Integrity:
 * - Validation performed via `validateFoodItem`.
 * - Derived fields (status, daysUntilExpiry) computed server-side to ensure consistency.
 */
import { prisma } from "../../../lib/prisma";
import { calculateStatusAndDays } from "../../../utils/status";
import { validateFoodItem } from "../../../utils/validation";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const foodItems = await prisma.foodItem.findMany({
        include: { category: true },
      });

      res.status(200).json(foodItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch food items" });
    }
  } else if (req.method === "POST") {
    try {
      // Accept client payload using `quantity` + `unit` (unit defaults to 'g') and map to DB fields
      const { name, quantity, unit, expiryDate, notes, categoryId } = req.body;

      const validation = validateFoodItem({
        name,
        quantity,
        unit,
        expiryDate,
        categoryId,
      });
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.errors,
        });
      }

      const { status, daysUntilExpiry } = calculateStatusAndDays(expiryDate);

      const newFood = await prisma.foodItem.create({
        data: {
          name: name.trim(),
          // store quantity into existing `volume` column and default unit to 'g'
          volume: quantity,
          volumeUnit: unit || 'g',
          expiryDate: new Date(expiryDate),
          notes: notes ? notes.trim() : notes,
          categoryId,
          status,
          daysUntilExpiry,
        },
      });

      res.status(201).json(newFood);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create food item" });
    }
  } else {
    // Method not supported; communicate allowed operations.
    res.status(405).json({ error: "Method not allowed", allowed: ["GET", "POST"] });
  }
}
