import { prisma } from "../../../lib/prisma";
import { calculateStatusAndDays } from "../../../utils/status";
import { validateFoodItem } from "../../../utils/validation";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: "Valid item ID is required" });
  }

  if (req.method === "PUT") {
    try {
      const { name, quantity, unit, expiryDate, notes, categoryId } = req.body;
      
      const validation = validateFoodItem({ name, quantity, unit, expiryDate, notes, categoryId });
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.errors 
        });
      }

      let updateData = {
        ...(name && { name: name.trim() }),
        ...(quantity && { quantity }),
        ...(unit && { unit: unit.trim() }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : notes }),
        ...(categoryId && { categoryId }),
      };

      if (expiryDate) {
        const { status, daysUntilExpiry } = calculateStatusAndDays(expiryDate);
        updateData = { ...updateData, status, daysUntilExpiry };
      }

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