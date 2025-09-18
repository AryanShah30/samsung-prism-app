import { prisma } from "../../../lib/prisma";
import { calculateStatusAndDays } from "../../../utils/status";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const { name, quantity, unit, expiryDate, notes, categoryId } = req.body;

      let updateData = {
        ...(name && { name }),
        ...(quantity && { quantity }),
        ...(unit && { unit }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(notes !== undefined && { notes }),
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