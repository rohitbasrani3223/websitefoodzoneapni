import { Router } from "express";
import { db } from "@workspace/db";
import { menuItemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListMenuItemsQueryParams,
  CreateMenuItemBody,
  GetMenuItemParams,
  UpdateMenuItemBody,
  UpdateMenuItemParams,
  DeleteMenuItemParams,
  ToggleMenuItemAvailabilityParams,
  ToggleMenuItemAvailabilityBody,
} from "@workspace/api-zod";

const router = Router();

// MUST come before /menu/:id to avoid Express matching "popular" as an id
router.get("/menu/popular", async (req, res) => {
  const items = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.isFeatured, true))
    .orderBy(desc(menuItemsTable.orderCount))
    .limit(8);
  res.json(items.map(formatItem));
});

router.get("/menu", async (req, res) => {
  const parsed = ListMenuItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category, available } = parsed.data;
  let query = db.select().from(menuItemsTable).$dynamic();
  if (category) {
    query = query.where(eq(menuItemsTable.category, category));
  }
  if (available !== undefined) {
    query = query.where(eq(menuItemsTable.available, available));
  }
  const items = await query.orderBy(menuItemsTable.category, menuItemsTable.name);
  res.json(items.map(formatItem));
});

router.post("/menu", async (req, res) => {
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const data = parsed.data;
  const [item] = await db.insert(menuItemsTable).values({
    name: data.name,
    description: data.description ?? null,
    price: String(data.price),
    halfPrice: data.halfPrice != null ? String(data.halfPrice) : null,
    category: data.category,
    image: data.image ?? null,
    available: data.available ?? true,
    isVeg: data.isVeg,
    isFeatured: data.isFeatured ?? false,
  }).returning();
  res.status(201).json(formatItem(item));
});

router.get("/menu/:id", async (req, res) => {
  const parsed = GetMenuItemParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, parsed.data.id));
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatItem(item));
});

router.put("/menu/:id", async (req, res) => {
  const paramsParsed = UpdateMenuItemParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateMenuItemBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const data = bodyParsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.halfPrice !== undefined) updateData.halfPrice = data.halfPrice != null ? String(data.halfPrice) : null;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.available !== undefined) updateData.available = data.available;
  if (data.isVeg !== undefined) updateData.isVeg = data.isVeg;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

  const [item] = await db.update(menuItemsTable).set(updateData).where(eq(menuItemsTable.id, paramsParsed.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatItem(item));
});

router.delete("/menu/:id", async (req, res) => {
  const parsed = DeleteMenuItemParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(menuItemsTable).where(eq(menuItemsTable.id, parsed.data.id));
  res.status(204).send();
});

router.patch("/menu/:id/availability", async (req, res) => {
  const paramsParsed = ToggleMenuItemAvailabilityParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = ToggleMenuItemAvailabilityBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [item] = await db
    .update(menuItemsTable)
    .set({ available: bodyParsed.data.available })
    .where(eq(menuItemsTable.id, paramsParsed.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatItem(item));
});

function formatItem(item: typeof menuItemsTable.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    price: Number(item.price),
    halfPrice: item.halfPrice != null ? Number(item.halfPrice) : null,
    category: item.category,
    image: item.image ?? null,
    available: item.available,
    isVeg: item.isVeg,
    isFeatured: item.isFeatured,
    orderCount: item.orderCount,
  };
}

export default router;
