import { pgTable, text, timestamp, uuid, numeric, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";
import { serviceTemplatesTable } from "./service_templates";

export interface AiContent {
  introduction: string;
  scope: string;
  timeline: string;
  investment: string;
}

export const proposalsTable = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  serviceTemplateId: uuid("service_template_id").references(() => serviceTemplatesTable.id).notNull(),
  proposalType: text("proposal_type").notNull().default("project"), // "recurring" | "project" | "consulting"
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientCompany: text("client_company"),
  status: text("status").notNull().default("draft"), // draft | sent | accepted | rejected
  customMessage: text("custom_message"),
  discountPercentage: integer("discount_percentage").notNull().default(0),
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  aiContent: json("ai_content").$type<AiContent>(),
  publicToken: text("public_token").unique(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProposalSchema = createInsertSchema(proposalsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposalsTable.$inferSelect;
