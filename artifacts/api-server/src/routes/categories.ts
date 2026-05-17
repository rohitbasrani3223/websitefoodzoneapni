import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, menuItemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  const itemCounts = await db
    .select({ category: menuItemsTable.category, count: sql<number>`count(*)::int` })
    .from(menuItemsTable)
    .groupBy(menuItemsTable.category);
  const countMap = new Map(itemCounts.map((r) => [r.category, r.count]));
  res.json(cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? null,
    itemCount: countMap.get(c.slug) ?? 0,
  })));
});

router.post("/categories", async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [cat] = await db.insert(categoriesTable).values({
    name: parsed.data.name,
    slug: parsed.data.slug,
    icon: parsed.data.icon ?? null,
  }).returning();
  res.status(201).json({ id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon ?? null, itemCount: 0 });
});

export default router;
