import { pgTable, serial, text, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  items: jsonb("items").notNull().$type<Array<{
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
    size?: string | null;
  }>>(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("received"),
  orderType: text("order_type").notNull().default("takeaway"),
  notes: text("notes"),
  tableNumber: text("table_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
