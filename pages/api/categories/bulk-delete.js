/**
 * Bulk delete categories endpoint (/api/categories/bulk-delete)
 *
 * Method: POST
 * Body: { categoryIds: number[] }
 * - Prevents deletion of categories that still have items.
 * - Returns counts and details of categories blocked due to existing items.
 */
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ error: "Category IDs array is required" });
    }

    const validIds = categoryIds.filter(
      (id) => Number.isInteger(Number(id)) && Number(id) > 0
    );

    if (validIds.length === 0) {
      return res.status(400).json({ error: "No valid category IDs provided" });
    }

    const categories = await prisma.category.findMany({
      where: { id: { in: validIds } },
      include: { _count: { select: { items: true } } },
    });

    const categoriesWithItems = categories.filter(
      (cat) => cat._count.items > 0
    );

    if (categoriesWithItems.length > 0) {
      return res.status(400).json({
        error: "Cannot delete categories with existing items",
        details: categoriesWithItems.map((cat) => ({
          id: cat.id,
          name: cat.name,
          itemCount: cat._count.items,
        })),
      });
    }

    const deletedCategories = await prisma.category.deleteMany({
      where: { id: { in: validIds } },
    });

    res.status(200).json({
      message: "Categories deleted successfully",
      deletedCount: deletedCategories.count,
      deletedIds: validIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete categories" });
  }
}
