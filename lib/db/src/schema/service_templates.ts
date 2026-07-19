import { pgTable, text, timestamp, uuid, numeric, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const serviceTemplatesTable = pgTable("service_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  durationDays: integer("duration_days").notNull().default(30),
  deliverables: json("deliverables").$type<string[]>().notNull().default([]),
  category: text("category").notNull().default("project"), // "recurring" | "project" | "consulting"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceTemplateSchema = createInsertSchema(serviceTemplatesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertServiceTemplate = z.infer<typeof insertServiceTemplateSchema>;
export type ServiceTemplate = typeof serviceTemplatesTable.$inferSelect;
