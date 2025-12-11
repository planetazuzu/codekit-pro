import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  plan: varchar("plan", { length: 20 }).default("free").notNull(), // free, pro, enterprise
  stripeCustomerId: text("stripe_customer_id"), // Stripe customer ID
  stripeSubscriptionId: text("stripe_subscription_id"), // Active subscription ID
  subscriptionStatus: varchar("subscription_status", { length: 20 }), // active, canceled, past_due, etc.
  subscriptionEndsAt: timestamp("subscription_ends_at"), // When subscription ends
  emailVerified: timestamp("email_verified"), // Email verification timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  plan: true,
});

export const updateUserSchema = insertUserSchema.partial().extend({
  id: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

// Prompts Schema
export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().default([]),
  status: varchar("status", { length: 20 }).default("approved").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("prompts_user_id_idx").on(table.userId),
  statusIdx: index("prompts_status_idx").on(table.status),
  createdAtIdx: index("prompts_created_at_idx").on(table.createdAt),
  userIdStatusIdx: index("prompts_user_id_status_idx").on(table.userId, table.status),
}));

export const insertPromptSchema = createInsertSchema(prompts).pick({
  title: true,
  category: true,
  content: true,
  tags: true,
});

export const updatePromptSchema = insertPromptSchema.partial().extend({
  id: z.string(),
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type UpdatePrompt = z.infer<typeof updatePromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

// Snippets Schema
export const snippets = pgTable("snippets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array().default([]),
  status: varchar("status", { length: 20 }).default("approved").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("snippets_user_id_idx").on(table.userId),
  statusIdx: index("snippets_status_idx").on(table.status),
  createdAtIdx: index("snippets_created_at_idx").on(table.createdAt),
  userIdStatusIdx: index("snippets_user_id_status_idx").on(table.userId, table.status),
}));

export const insertSnippetSchema = createInsertSchema(snippets).pick({
  title: true,
  language: true,
  code: true,
  description: true,
  tags: true,
});

export const updateSnippetSchema = insertSnippetSchema.partial().extend({
  id: z.string(),
});

export type InsertSnippet = z.infer<typeof insertSnippetSchema>;
export type UpdateSnippet = z.infer<typeof updateSnippetSchema>;
export type Snippet = typeof snippets.$inferSelect;

// Links Schema
export const links = pgTable("links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: varchar("icon", { length: 100 }),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("approved").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("links_user_id_idx").on(table.userId),
  statusIdx: index("links_status_idx").on(table.status),
  createdAtIdx: index("links_created_at_idx").on(table.createdAt),
  userIdStatusIdx: index("links_user_id_status_idx").on(table.userId, table.status),
}));

export const insertLinkSchema = createInsertSchema(links).pick({
  title: true,
  url: true,
  icon: true,
  category: true,
  description: true,
});

export const updateLinkSchema = insertLinkSchema.partial().extend({
  id: z.string(),
});

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type UpdateLink = z.infer<typeof updateLinkSchema>;
export type Link = typeof links.$inferSelect;

// Guides Schema
export const guides = pgTable("guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  type: varchar("type", { length: 50 }).notNull(), // 'ui', 'manual', 'template', etc.
  tags: text("tags").array().default([]),
  imageUrl: text("image_url"),
  status: varchar("status", { length: 20 }).default("approved").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("guides_user_id_idx").on(table.userId),
  statusIdx: index("guides_status_idx").on(table.status),
  createdAtIdx: index("guides_created_at_idx").on(table.createdAt),
  userIdStatusIdx: index("guides_user_id_status_idx").on(table.userId, table.status),
}));

export const insertGuideSchema = createInsertSchema(guides).pick({
  title: true,
  description: true,
  content: true,
  type: true,
  tags: true,
  imageUrl: true,
});

export const updateGuideSchema = insertGuideSchema.partial().extend({
  id: z.string(),
});

export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type UpdateGuide = z.infer<typeof updateGuideSchema>;
export type Guide = typeof guides.$inferSelect;

// Analytics/Views Schema
export const views = pgTable("views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  page: varchar("page", { length: 100 }).notNull(), // e.g., '/tools/readme', '/prompts', etc.
  entityType: varchar("entity_type", { length: 50 }), // 'prompt', 'snippet', 'link', 'guide', 'tool', 'page'
  entityId: varchar("entity_id", { length: 100 }), // ID of the specific entity if applicable
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
});

export const insertViewSchema = createInsertSchema(views).pick({
  page: true,
  entityType: true,
  entityId: true,
  userAgent: true,
  referrer: true,
});

export type InsertView = z.infer<typeof insertViewSchema>;
export type View = typeof views.$inferSelect;

// Affiliates Schema
export const affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  url: text("url").notNull(),
  code: text("code"),
  commission: text("commission"),
  icon: varchar("icon", { length: 100 }),
  utm: text("utm"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).pick({
  name: true,
  category: true,
  url: true,
  code: true,
  commission: true,
  icon: true,
  utm: true,
});

export const updateAffiliateSchema = insertAffiliateSchema.partial().extend({
  id: z.string(),
});

export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type UpdateAffiliate = z.infer<typeof updateAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

// Affiliate Clicks Schema
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id", { length: 100 }).notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).pick({
  affiliateId: true,
  userAgent: true,
  referrer: true,
});

export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;

// Affiliate Programs Tracker Schema
// This table tracks the status and management of affiliate programs
export const affiliatePrograms = pgTable("affiliate_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  registrationUrl: text("registration_url"),
  dashboardUrl: text("dashboard_url"),
  status: varchar("status", { length: 50 }).notNull().default("not_requested"), // not_requested, pending, approved, rejected, inactive
  requestDate: timestamp("request_date"),
  approvalDate: timestamp("approval_date"),
  notes: text("notes"),
  tags: text("tags").array().default([]),
  priority: varchar("priority", { length: 20 }).default("medium"), // high, medium, low
  integrationType: varchar("integration_type", { length: 50 }).default("manual"), // manual, impact, partnerstack, awin, other
  integrationConfig: text("integration_config"), // JSON string with API keys, etc.
  lastSyncAt: timestamp("last_sync_at"),
  totalClicks: integer("total_clicks").default(0),
  estimatedRevenue: real("estimated_revenue").default(0),
  internalNotes: text("internal_notes"), // Sensitive data like passwords
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAffiliateProgramSchema = createInsertSchema(affiliatePrograms).pick({
  name: true,
  category: true,
  registrationUrl: true,
  dashboardUrl: true,
  status: true,
  requestDate: true,
  approvalDate: true,
  notes: true,
  tags: true,
  priority: true,
  integrationType: true,
  integrationConfig: true,
  lastSyncAt: true,
  totalClicks: true,
  estimatedRevenue: true,
  internalNotes: true,
});

export const updateAffiliateProgramSchema = insertAffiliateProgramSchema.partial().extend({
  id: z.string(),
});

export type InsertAffiliateProgram = z.infer<typeof insertAffiliateProgramSchema>;
export type UpdateAffiliateProgram = z.infer<typeof updateAffiliateProgramSchema>;
export type AffiliateProgram = typeof affiliatePrograms.$inferSelect;
