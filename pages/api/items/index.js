import { PrismaClient } from "@prisma/client";
import { calculateStatus } from "../../../utils/status";

// Prisma client for DB access
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Fetch all food items including their category
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
      const { name, quantity, unit, expiryDate, notes, categoryId } = req.body;

      // Validate required fields
      if (!name || !quantity || !unit || !expiryDate || !categoryId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const status = calculateStatus(expiryDate);

      // Insert new item
      const newFood = await prisma.foodItem.create({
        data: { name, quantity, unit, expiryDate: new Date(expiryDate), notes, categoryId, status },
      });

      res.status(201).json(newFood);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create food item" });
    }

  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}