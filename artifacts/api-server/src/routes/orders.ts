import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, menuItemsTable } from "@workspace/db";
import { eq, sql, inArray } from "drizzle-orm";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";

const DELIVERY_CHARGE = 30;

const router = Router();

router.get("/orders", async (req, res) => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  let query = db.select().from(ordersTable).$dynamic();
  if (parsed.data.status) {
    query = query.where(eq(ordersTable.status, parsed.data.status));
  }
  const orders = await query.orderBy(sql`${ordersTable.createdAt} desc`);
  res.json(orders.map(formatOrder));
});

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const data = parsed.data;

  const isDelivery = data.orderType === "delivery";

  if (isDelivery && !data.deliveryAddress) {
    res.status(400).json({ error: "Delivery address is required for delivery orders" });
    return;
  }

  const itemsTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = isDelivery ? DELIVERY_CHARGE : 0;
  const total = itemsTotal + deliveryCharge;

  const [order] = await db.insert(ordersTable).values({
    customerName: data.customerName,
    phone: data.phone,
    items: data.items,
    total: String(total),
    status: "received",
    orderType: data.orderType,
    notes: data.notes ?? null,
    tableNumber: data.tableNumber ?? null,
    deliveryAddress: isDelivery ? (data.deliveryAddress ?? null) : null,
    deliveryLandmark: isDelivery ? (data.deliveryLandmark ?? null) : null,
    deliveryArea: isDelivery ? (data.deliveryArea ?? null) : null,
    deliveryCharge: String(deliveryCharge),
  }).returning();

  const menuItemIds = data.items.map((i) => i.menuItemId);
  if (menuItemIds.length > 0) {
    await db
      .update(menuItemsTable)
      .set({ orderCount: sql`${menuItemsTable.orderCount} + 1` })
      .where(inArray(menuItemsTable.id, menuItemIds));
  }

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", async (req, res) => {
  const parsed = GetOrderParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, parsed.data.id));
  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatOrder(order));
});

router.patch("/orders/:id/status", async (req, res) => {
  const paramsParsed = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set({ status: bodyParsed.data.status })
    .where(eq(ordersTable.id, paramsParsed.data.id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatOrder(order));
});

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    items: order.items,
    total: Number(order.total),
    status: order.status,
    orderType: order.orderType,
    notes: order.notes ?? null,
    tableNumber: order.tableNumber ?? null,
    deliveryAddress: order.deliveryAddress ?? null,
    deliveryLandmark: order.deliveryLandmark ?? null,
    deliveryArea: order.deliveryArea ?? null,
    deliveryCharge: Number(order.deliveryCharge ?? 0),
    createdAt: order.createdAt.toISOString(),
  };
}

export default router;
