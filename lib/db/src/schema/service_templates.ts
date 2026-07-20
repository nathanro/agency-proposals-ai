import { pgTable, text, timestamp, uuid, numeric, integer, boolean, json } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { organizationsTable } from "./organizations";

export const serviceTemplatesTable = pgTable("service_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizationsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  durationDays: integer("duration_days").notNull().default(30),
  deliverables: json("deliverables").$type<string[]>().notNull().default([]),
  category: text("category").notNull().default("project"),
  isActive: boolean("is_active").notNull().default(true),
  // Tracks which Publiexpert catalog service this template was imported from (soft reference)
  sourceServiceId: uuid("source_service_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ServiceTemplate = typeof serviceTemplatesTable.$inferSelect;
export type InsertServiceTemplate = typeof serviceTemplatesTable.$inferInsert;
