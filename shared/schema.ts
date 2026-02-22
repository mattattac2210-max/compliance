import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, date, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username"),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  lastLogin: text("last_login"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isPro: boolean("is_pro").notNull().default(false),
  proGrantedAt: text("pro_granted_at"),
  proGrantedBy: text("pro_granted_by"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  isAdmin: true,
  isPro: true,
  proGrantedAt: true,
  proGrantedBy: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const supportAccessGrants = pgTable("support_access_grants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  grantedAt: text("granted_at").notNull().default(sql`now()`),
  revokedAt: text("revoked_at"),
  isActive: boolean("is_active").notNull().default(true),
  lastAccessedAt: text("last_accessed_at"),
  lastAccessedBy: text("last_accessed_by"),
});

export type SupportAccessGrant = typeof supportAccessGrants.$inferSelect;

export const adminAccessLog = pgTable("admin_access_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  targetUserId: varchar("target_user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  timestamp: text("timestamp").notNull().default(sql`now()`),
  metadata: json("metadata").$type<Record<string, string>>(),
});

export type AdminAccessLogEntry = typeof adminAccessLog.$inferSelect;

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
  banjars: text("banjars"),
  banjarIntroDate: text("banjar_intro_date"),
  banjarNotes: text("banjar_notes"),
  entityStructure: text("entity_structure").default("pt_pma"),
  otaEntityName: text("ota_entity_name"),
  otaIdentityChecked: boolean("ota_identity_checked").default(false),
  landTitleType: text("land_title_type"),
  landTitleExpiry: text("land_title_expiry"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export const vaultDocumentTemplates = pgTable("vault_document_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gateNumber: integer("gate_number").notNull(),
  documentSlug: text("document_slug").notNull().unique(),
  isRequired: boolean("is_required").notNull().default(true),
  expiryMonths: integer("expiry_months"),
  translations: json("translations").$type<Record<string, { name: string; description: string }>>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertVaultDocumentTemplateSchema = createInsertSchema(vaultDocumentTemplates).omit({ id: true });
export type InsertVaultDocumentTemplate = z.infer<typeof insertVaultDocumentTemplateSchema>;
export type VaultDocumentTemplate = typeof vaultDocumentTemplates.$inferSelect;

export const vaultDocuments = pgTable("vault_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  templateId: varchar("template_id").notNull().references(() => vaultDocumentTemplates.id),
  status: text("status").notNull().default("missing"),
  expiryDate: text("expiry_date"),
  uploadedAt: text("uploaded_at"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  notes: text("notes"),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const insertVaultDocumentSchema = createInsertSchema(vaultDocuments).omit({ id: true });
export type InsertVaultDocument = z.infer<typeof insertVaultDocumentSchema>;
export type VaultDocument = typeof vaultDocuments.$inferSelect;

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

export const banjarContributions = pgTable("banjar_contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  contributionDate: text("contribution_date").notNull(),
  contributionType: text("contribution_type").notNull(),
  amount: integer("amount"),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const insertBanjarContributionSchema = createInsertSchema(banjarContributions).omit({ id: true, createdAt: true });
export type InsertBanjarContribution = z.infer<typeof insertBanjarContributionSchema>;
export type BanjarContribution = typeof banjarContributions.$inferSelect;

export const recurringFilings = pgTable("recurring_filings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  filingType: text("filing_type").notNull(),
  periodLabel: text("period_label").notNull(),
  dueDate: text("due_date").notNull(),
  filedDate: text("filed_date"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const insertRecurringFilingSchema = createInsertSchema(recurringFilings).omit({ id: true });
export type InsertRecurringFiling = z.infer<typeof insertRecurringFilingSchema>;
export type RecurringFiling = typeof recurringFilings.$inferSelect;

export const staffMembers = pgTable("staff_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  startDate: text("start_date"),
  isActive: boolean("is_active").notNull().default(true),
  bpjsKesehatanStatus: text("bpjs_kesehatan_status").default("not_registered"),
  bpjsKesehatanMemberId: text("bpjs_kesehatan_member_id"),
  bpjsKetenagakerjaanStatus: text("bpjs_ketenagakerjaan_status").default("not_registered"),
  bpjsKetenagakerjaanMemberId: text("bpjs_ketenagakerjaan_member_id"),
  thrDue: boolean("thr_due").default(false),
  kitas: text("kitas"),
  kitasExpiry: text("kitas_expiry"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({ id: true, createdAt: true });
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;
export type StaffMember = typeof staffMembers.$inferSelect;

export const updatePreferences = pgTable("update_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  autoApplyCalendar: boolean("auto_apply_calendar").notNull().default(false),
  autoApplyVault: boolean("auto_apply_vault").notNull().default(false),
  requireApprovalCalendar: boolean("require_approval_calendar").notNull().default(true),
  requireApprovalVault: boolean("require_approval_vault").notNull().default(true),
  notifyInApp: boolean("notify_in_app").notNull().default(true),
  notifyEmail: boolean("notify_email").notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const insertUpdatePreferencesSchema = createInsertSchema(updatePreferences).omit({ id: true, updatedAt: true });
export type InsertUpdatePreferences = z.infer<typeof insertUpdatePreferencesSchema>;
export type UpdatePreferences = typeof updatePreferences.$inferSelect;

export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  gate: integer("gate"),
  regency: text("regency"),
  requiresAction: boolean("requires_action").notNull().default(false),
  actionLabel: text("action_label"),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").notNull().default(false),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  pendingChangeType: text("pending_change_type"),
  pendingChangeData: json("pending_change_data").$type<Record<string, unknown>>(),
  changeId: text("change_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({ id: true, createdAt: true });
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;

export const regulatoryChanges = pgTable("regulatory_changes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  whatChanged: text("what_changed").notNull(),
  severity: text("severity").notNull().default("medium"),
  gate: integer("gate"),
  regions: json("regions").$type<string[]>().notNull().default(sql`'["all"]'`),
  actionsApplied: json("actions_applied").$type<Array<{
    type: string;
    description: string;
    affectedCount: number;
    appliedAt: string;
  }>>().default(sql`'[]'`),
  userMessage: text("user_message"),
  status: text("status").notNull().default("pending"),
  adminId: varchar("admin_id").references(() => users.id),
  appliedAt: text("applied_at"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const insertRegulatoryChangeSchema = createInsertSchema(regulatoryChanges).omit({ id: true, createdAt: true });
export type InsertRegulatoryChange = z.infer<typeof insertRegulatoryChangeSchema>;
export type RegulatoryChange = typeof regulatoryChanges.$inferSelect;
