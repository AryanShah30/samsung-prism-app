import { prisma } from "../../../lib/prisma";
import { validateCategory } from "../../../utils/validation";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: "Valid category ID is required" });
  }

  if (req.method === "PUT") {
    try {
      const { name } = req.body;

      const validation = validateCategory({ name });
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.errors,
        });
      }

      const updatedCategory = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { name: name.trim() },
      });

      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error(error);
      if (error.code === "P2002") {
        res.status(409).json({ error: "Category name already exists" });
      } else if (error.code === "P2025") {
        res.status(404).json({ error: "Category not found" });
      } else {
        res.status(500).json({ error: "Failed to update category" });
      }
    }
  } else if (req.method === "DELETE") {
    try {
      const categoryId = parseInt(id);

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { _count: { select: { items: true } } },
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      if (category._count.items > 0) {
        return res.status(400).json({
          error: "Cannot delete category with existing items",
          details: `This category has ${category._count.items} item(s). Please delete or move the items first.`,
        });
      }

      const deletedCategory = await prisma.category.delete({
        where: { id: categoryId },
      });

      res.status(200).json({
        message: "Category deleted successfully",
        category: deletedCategory,
      });
    } catch (error) {
      console.error(error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Category not found" });
      } else {
        res.status(500).json({ error: "Failed to delete category" });
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
