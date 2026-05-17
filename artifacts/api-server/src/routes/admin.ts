import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, menuItemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "shakti123";

router.post("/admin/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { username, password } = parsed.data;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
  res.json({ token, message: "Login successful" });
});

router.get("/admin/dashboard", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ordersToday] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(sql`${ordersTable.createdAt} >= ${today}`);

  const [revenueToday] = await db
    .select({ total: sql<number>`coalesce(sum(${ordersTable.total}::numeric), 0)` })
    .from(ordersTable)
    .where(sql`${ordersTable.createdAt} >= ${today} AND ${ordersTable.status} != 'cancelled'`);

  const [pendingOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(sql`${ordersTable.status} IN ('received', 'preparing')`);

  const [completedOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(eq(ordersTable.status, "completed"));

  const [totalMenuItems] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(menuItemsTable);

  const [popularItem] = await db
    .select({ name: menuItemsTable.name })
    .from(menuItemsTable)
    .orderBy(sql`${menuItemsTable.orderCount} desc`)
    .limit(1);

  const weeklyRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const [rev] = await db
      .select({ total: sql<number>`coalesce(sum(${ordersTable.total}::numeric), 0)` })
      .from(ordersTable)
      .where(sql`${ordersTable.createdAt} >= ${d} AND ${ordersTable.createdAt} < ${next} AND ${ordersTable.status} != 'cancelled'`);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weeklyRevenue.push({ day: days[d.getDay()], revenue: Number(rev.total) });
  }

  res.json({
    totalOrdersToday: ordersToday.count,
    revenueToday: Number(revenueToday.total),
    pendingOrders: pendingOrders.count,
    completedOrders: completedOrders.count,
    popularItem: popularItem?.name ?? null,
    totalMenuItems: totalMenuItems.count,
    weeklyRevenue,
  });
});

export default router;
