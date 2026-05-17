import { pgTable, serial, text, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  halfPrice: numeric("half_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  image: text("image"),
  available: boolean("available").notNull().default(true),
  isVeg: boolean("is_veg").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  orderCount: integer("order_count").notNull().default(0),
});

export const insertMenuItemSchema = createInsertSchema(menuItemsTable).omit({ id: true });
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItemsTable.$inferSelect;
