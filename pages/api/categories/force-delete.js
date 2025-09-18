import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { categoryId, moveToCategoryId } = req.body;
    
    if (!categoryId || !Number.isInteger(Number(categoryId))) {
      return res.status(400).json({ error: "Valid category ID is required" });
    }

    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
      include: { _count: { select: { items: true } } }
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (category._count.items === 0) {
      const deletedCategory = await prisma.category.delete({
        where: { id: parseInt(categoryId) }
      });

      return res.status(200).json({
        message: "Category deleted successfully",
        category: deletedCategory,
        itemsMoved: 0
      });
    }

    if (moveToCategoryId) {
      const targetCategory = await prisma.category.findUnique({
        where: { id: parseInt(moveToCategoryId) }
      });

      if (!targetCategory) {
        return res.status(404).json({ error: "Target category not found" });
      }

      await prisma.foodItem.updateMany({
        where: { categoryId: parseInt(categoryId) },
        data: { categoryId: parseInt(moveToCategoryId) }
      });
    } else {
      const defaultCategory = await prisma.category.findFirst({
        orderBy: { name: 'asc' }
      });

      if (!defaultCategory) {
        return res.status(400).json({ 
          error: "Cannot delete category with items. No other categories exist to move items to." 
        });
      }

      await prisma.foodItem.updateMany({
        where: { categoryId: parseInt(categoryId) },
        data: { categoryId: defaultCategory.id }
      });
    }

    const deletedCategory = await prisma.category.delete({
      where: { id: parseInt(categoryId) }
    });

    res.status(200).json({
      message: "Category deleted successfully",
      category: deletedCategory,
      itemsMoved: category._count.items,
      movedToCategoryId: moveToCategoryId || (await prisma.category.findFirst({ orderBy: { name: 'asc' } }))?.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete category" });
  }
}
