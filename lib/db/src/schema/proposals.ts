import { pgTable, text, timestamp, uuid, numeric, integer, json } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { serviceTemplatesTable } from "./service_templates";
import { organizationsTable } from "./organizations";

export interface AiContent {
  introduction: string;
  scope: string;
  timeline: string;
  investment: string;
}

export const proposalsTable = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizationsTable.id, { onDelete: "cascade" }),
  serviceTemplateId: uuid("service_template_id").references(() => serviceTemplatesTable.id).notNull(),
  proposalType: text("proposal_type").notNull().default("project"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientCompany: text("client_company"),
  status: text("status").notNull().default("draft"),
  customMessage: text("custom_message"),
  discountPercentage: integer("discount_percentage").notNull().default(0),
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  aiContent: json("ai_content").$type<AiContent>(),
  publicToken: text("public_token").unique(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Proposal = typeof proposalsTable.$inferSelect;
export type InsertProposal = typeof proposalsTable.$inferInsert;
