import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  agencyName: text("agency_name"), // legacy — org name is now in organizationsTable
  organizationId: uuid("organization_id").references(() => organizationsTable.id, { onDelete: "set null" }),
  role: text("role").notNull().default("owner"), // "owner" | "member"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
