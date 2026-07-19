import { pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";

export const organizationsTable = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#7c3aed"),
  customDomain: text("custom_domain").unique(),
  plan: text("plan").notNull().default("free"), // free | starter | pro | agency
  giftedAccess: boolean("gifted_access").notNull().default(false),
  proposalLimit: integer("proposal_limit").notNull().default(10),
  memberLimit: integer("member_limit").notNull().default(1),
  ownerEmail: text("owner_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Organization = typeof organizationsTable.$inferSelect;
export type InsertOrganization = typeof organizationsTable.$inferInsert;

// Plan definitions for easy reference
export const PLAN_LIMITS: Record<string, { proposals: number; members: number }> = {
  free:    { proposals: 10,  members: 1  },
  starter: { proposals: 50,  members: 3  },
  pro:     { proposals: 200, members: 10 },
  agency:  { proposals: 500, members: 25 },
};
