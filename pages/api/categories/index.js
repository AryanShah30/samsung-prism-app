import { prisma } from "../../../lib/prisma";
import { validateCategory } from "../../../utils/validation";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  } else if (req.method === "POST") {
    try {
      const { name } = req.body;

      const validation = validateCategory({ name });
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.errors,
        });
      }

      const newCategory = await prisma.category.create({
        data: { name: name.trim() },
      });

      res.status(201).json(newCategory);
    } catch (error) {
      console.error(error);
      if (error.code === "P2002") {
        res.status(409).json({ error: "Category already exists" });
      } else {
        res.status(500).json({ error: "Failed to create category" });
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
