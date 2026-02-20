import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, date, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`now()`),
  lastLogin: text("last_login"),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyName: text("property_name").notNull(),
  entityName: text("entity_name").notNull(),
  nib: text("nib"),
  address: text("address"),
  regency: text("regency"),
  kbli: text("kbli"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export interface TermTranslation {
  term?: string;
  tags?: string[];
  plainDefinition: string;
  whyItMatters: string[];
  typicalProcessSteps?: string[] | null;
  whatToStore: string[];
  commonPitfalls?: string[] | null;
}

export type TermTranslations = Record<string, TermTranslation>;

export const complianceTerms = pgTable("compliance_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  term: text("term").notNull().unique(),
  slug: text("slug").notNull().unique(),
  plainDefinition: text("plain_definition").notNull(),
  whyItMatters: json("why_it_matters").$type<string[]>().notNull(),
  typicalProcessSteps: json("typical_process_steps").$type<string[]>(),
  whatToStore: json("what_to_store").$type<string[]>().notNull(),
  commonPitfalls: json("common_pitfalls").$type<string[]>(),
  synonyms: json("synonyms").$type<string[]>(),
  tags: json("tags").$type<string[]>().notNull(),
  lastUpdated: date("last_updated").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  translations: json("translations").$type<TermTranslations>(),
});

export const insertComplianceTermSchema = createInsertSchema(complianceTerms).omit({
  id: true,
});

export type InsertComplianceTerm = z.infer<typeof insertComplianceTermSchema>;
export type ComplianceTerm = typeof complianceTerms.$inferSelect;

export interface ExpandDetails {
  whyThisMatters?: string;
  commonIssues?: string[];
  preparationTips?: string[];
  storageReminders?: string[];
}

export interface SequenceStep {
  stepNumber: number;
  actionDescription: string;
  whereItGoes: string;
  digitalOrPhysical: "digital" | "physical" | "hybrid";
  whoHandlesIt: string;
  notes?: string;
  expandDetails?: ExpandDetails;
}

export interface GuideTranslation {
  title: string;
  summary: string;
  authorityHandledBy: string;
  sequenceSteps: SequenceStep[];
  whatToExpect: string[];
  typicalDelays: string[];
  commonRejectionReasons: string[];
  dscvrRecommendedStorage: string[];
}

export type GuideTranslations = Record<string, GuideTranslation>;

export const processNavigationGuides = pgTable("process_navigation_guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gateNumber: integer("gate_number").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  authorityHandledBy: text("authority_handled_by").notNull(),
  submissionType: text("submission_type").notNull(),
  sequenceSteps: json("sequence_steps").$type<SequenceStep[]>().notNull(),
  whatToExpect: json("what_to_expect").$type<string[]>().notNull(),
  typicalDelays: json("typical_delays").$type<string[]>().notNull(),
  commonRejectionReasons: json("common_rejection_reasons").$type<string[]>().notNull(),
  dscvrRecommendedStorage: json("dscvr_recommended_storage").$type<string[]>().notNull(),
  lastUpdated: date("last_updated").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  translations: json("translations").$type<GuideTranslations>(),
});

export const insertProcessGuideSchema = createInsertSchema(processNavigationGuides).omit({
  id: true,
});

export type InsertProcessGuide = z.infer<typeof insertProcessGuideSchema>;
export type ProcessGuide = typeof processNavigationGuides.$inferSelect;
