import { PrismaClient } from "@prisma/client";
import { calculateStatus } from "../../../utils/status";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query; // Food item ID from URL

  if (req.method === "PUT") {
    try {
      const { name, quantity, unit, expiryDate, notes, categoryId } = req.body;

      // Recalculate status only if expiryDate is provided
      const status = expiryDate ? calculateStatus(expiryDate) : undefined;

      // Only update fields provided in request
      const updateData = {
        ...(name && { name }),
        ...(quantity && { quantity }),
        ...(unit && { unit }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(notes !== undefined && { notes }),
        ...(categoryId && { categoryId }),
        ...(status && { status }),
      };

      const updatedFood = await prisma.foodItem.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.status(200).json(updatedFood);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update food item" });
    }

  } else if (req.method === "DELETE") {
    try {
      // Remove item by ID
      const deletedFood = await prisma.foodItem.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: "Food item deleted successfully", item: deletedFood });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete food item" });
    }

  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}