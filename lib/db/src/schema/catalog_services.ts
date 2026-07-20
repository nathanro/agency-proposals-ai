import { pgTable, text, timestamp, uuid, numeric, integer, boolean, json } from "drizzle-orm/pg-core";

export const catalogServicesTable = pgTable("catalog_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("project"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  suggestedPrice: numeric("suggested_price", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  durationDays: integer("duration_days").notNull().default(30),
  deliverables: json("deliverables").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CatalogService = typeof catalogServicesTable.$inferSelect;
export type InsertCatalogService = typeof catalogServicesTable.$inferInsert;
