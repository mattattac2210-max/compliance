import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const complianceTerms = pgTable("compliance_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  term: text("term").notNull().unique(),
  slug: text("slug").notNull().unique(),
  plainDefinition: text("plain_definition").notNull(),
  whyItMatters: json("why_it_matters").$type<string[]>().notNull(),
  typicalProcessSteps: json("typical_process_steps").$type<string[]>(),
  whatToStore: json("what_to_store").$type<string[]>().notNull(),
  commonPitfalls: json("common_pitfalls").$type<string[]>(),
  tags: json("tags").$type<string[]>().notNull(),
  lastUpdated: date("last_updated").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertComplianceTermSchema = createInsertSchema(complianceTerms).omit({
  id: true,
});

export type InsertComplianceTerm = z.infer<typeof insertComplianceTermSchema>;
export type ComplianceTerm = typeof complianceTerms.$inferSelect;
