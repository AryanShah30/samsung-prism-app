import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { itemIds } = req.body;
    
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: "Item IDs array is required" });
    }

    const validIds = itemIds.filter(id => Number.isInteger(Number(id)) && Number(id) > 0);
    
    if (validIds.length === 0) {
      return res.status(400).json({ error: "No valid item IDs provided" });
    }

    const existingItems = await prisma.foodItem.findMany({
      where: { id: { in: validIds } },
      select: { id: true, name: true }
    });

    const existingIds = existingItems.map(item => item.id);
    const notFoundIds = validIds.filter(id => !existingIds.includes(id));

    const deletedItems = await prisma.foodItem.deleteMany({
      where: { id: { in: existingIds } }
    });

    res.status(200).json({
      message: "Items deleted successfully",
      deletedCount: deletedItems.count,
      deletedIds: existingIds,
      notFoundIds: notFoundIds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete items" });
  }
}
