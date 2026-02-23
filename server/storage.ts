import {
  type User, type InsertUser,
  type ComplianceTerm, type InsertComplianceTerm,
  type ProcessGuide, type InsertProcessGuide,
  type Property, type InsertProperty,
  type VaultDocumentTemplate, type InsertVaultDocumentTemplate,
  type VaultDocument, type InsertVaultDocument,
  type SupportAccessGrant, type AdminAccessLogEntry,
  type BanjarContribution, type InsertBanjarContribution,
  type RecurringFiling, type InsertRecurringFiling,
  type StaffMember, type InsertStaffMember,
  type UpdatePreferences, type InsertUpdatePreferences,
  type UserNotification, type InsertUserNotification,
  type RegulatoryChange, type InsertRegulatoryChange,
  type CalendarEventTemplate, type InsertCalendarEventTemplate,
  users, complianceTerms, processNavigationGuides, properties,
  vaultDocumentTemplates, vaultDocuments,
  supportAccessGrants, adminAccessLog,
  banjarContributions, recurringFilings, staffMembers,
  updatePreferences, userNotifications, regulatoryChanges,
  calendarEventTemplates,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  getUserById(id: string): Promise<User | undefined>;
  updateUserPro(id: string, isPro: boolean): Promise<User | undefined>;
  updateUserFirstName(id: string, firstName: string | null): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<void>;

  getPropertiesByUserId(userId: string): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  softDeleteProperty(id: string): Promise<void>;

  getAllTerms(activeOnly?: boolean): Promise<ComplianceTerm[]>;
  getTermBySlug(slug: string): Promise<ComplianceTerm | undefined>;
  getTermById(id: string): Promise<ComplianceTerm | undefined>;
  searchTerms(query: string, tags?: string[]): Promise<ComplianceTerm[]>;
  createTerm(term: InsertComplianceTerm): Promise<ComplianceTerm>;
  updateTerm(id: string, term: Partial<InsertComplianceTerm>): Promise<ComplianceTerm | undefined>;
  getAllGuides(activeOnly?: boolean): Promise<ProcessGuide[]>;
  getGuideById(id: string): Promise<ProcessGuide | undefined>;
  createGuide(guide: InsertProcessGuide): Promise<ProcessGuide>;
  updateGuide(id: string, guide: Partial<InsertProcessGuide>): Promise<ProcessGuide | undefined>;

  getAllTemplates(): Promise<VaultDocumentTemplate[]>;
  getVaultDocumentsByProperty(propertyId: string): Promise<VaultDocument[]>;
  upsertVaultDocument(doc: InsertVaultDocument): Promise<VaultDocument>;
  updateVaultDocument(id: string, updates: Partial<InsertVaultDocument>): Promise<VaultDocument | undefined>;
  getVaultDocumentById(id: string): Promise<VaultDocument | undefined>;
  getVaultDocumentByPropertyAndTemplate(propertyId: string, templateId: string): Promise<VaultDocument | undefined>;
  getVaultDocumentByFileUrl(fileUrl: string): Promise<VaultDocument | undefined>;

  getAllUsers(): Promise<User[]>;
  updateUserAdmin(id: string, isAdmin: boolean): Promise<User | undefined>;
  updateUserProWithGranter(id: string, isPro: boolean, granterId: string): Promise<User | undefined>;

  getSupportGrant(userId: string): Promise<SupportAccessGrant | undefined>;
  createOrReactivateSupportGrant(userId: string): Promise<SupportAccessGrant>;
  revokeSupportGrant(userId: string): Promise<void>;
  updateSupportGrantAccess(userId: string, adminId: string): Promise<void>;

  createAccessLogEntry(adminId: string, targetUserId: string, action: string, metadata?: Record<string, string>): Promise<AdminAccessLogEntry>;
  getAccessLog(limit: number, offset: number): Promise<Array<AdminAccessLogEntry & { adminEmail?: string; targetEmail?: string }>>;
  getActiveGrantUserIds(): Promise<string[]>;
  getPropertyCountsByUserIds(): Promise<Map<string, number>>;

  getBanjarContributions(propertyId: string): Promise<BanjarContribution[]>;
  createBanjarContribution(contrib: InsertBanjarContribution): Promise<BanjarContribution>;
  deleteBanjarContribution(id: string): Promise<void>;

  getStaffMembers(propertyId: string): Promise<StaffMember[]>;
  createStaffMember(staff: InsertStaffMember): Promise<StaffMember>;
  updateStaffMember(id: string, updates: Partial<InsertStaffMember>): Promise<StaffMember | undefined>;
  deleteStaffMember(id: string): Promise<void>;

  getRecurringFilings(propertyId: string): Promise<RecurringFiling[]>;
  createRecurringFiling(filing: InsertRecurringFiling): Promise<RecurringFiling>;
  updateRecurringFiling(id: string, updates: Partial<InsertRecurringFiling>): Promise<RecurringFiling | undefined>;
  deleteRecurringFiling(id: string): Promise<void>;

  getUpdatePreferences(userId: string): Promise<UpdatePreferences | undefined>;
  upsertUpdatePreferences(userId: string, prefs: Partial<InsertUpdatePreferences>): Promise<UpdatePreferences>;

  getUserNotifications(userId: string): Promise<UserNotification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  getNotificationById(id: string): Promise<UserNotification | undefined>;
  createUserNotification(notif: InsertUserNotification): Promise<UserNotification>;
  markNotificationRead(id: string, userId: string): Promise<void>;
  dismissNotification(id: string, userId: string): Promise<void>;

  getRegulatoryChanges(): Promise<RegulatoryChange[]>;
  getRegulatoryChangeById(id: string): Promise<RegulatoryChange | undefined>;
  createRegulatoryChange(change: InsertRegulatoryChange): Promise<RegulatoryChange>;
  updateRegulatoryChange(id: string, updates: Partial<RegulatoryChange>): Promise<RegulatoryChange | undefined>;

  getVaultTemplateBySlug(slug: string): Promise<VaultDocumentTemplate | undefined>;
  createVaultDocumentTemplate(template: InsertVaultDocumentTemplate): Promise<VaultDocumentTemplate>;

  getRecurringFilingById(id: string): Promise<RecurringFiling | undefined>;

  getAllCalendarEventTemplates(activeOnly?: boolean): Promise<CalendarEventTemplate[]>;
  getCalendarEventTemplateById(id: string): Promise<CalendarEventTemplate | undefined>;
  getCalendarEventTemplateByKey(eventKey: string): Promise<CalendarEventTemplate | undefined>;
  createCalendarEventTemplate(template: InsertCalendarEventTemplate): Promise<CalendarEventTemplate>;
  updateCalendarEventTemplate(id: string, updates: Partial<InsertCalendarEventTemplate>): Promise<CalendarEventTemplate | undefined>;
  deleteCalendarEventTemplate(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db.update(users).set({ lastLogin: new Date().toISOString() }).where(eq(users.id, id));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserPro(id: string, isPro: boolean): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ isPro, proGrantedAt: isPro ? new Date().toISOString() : null })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserFirstName(id: string, firstName: string | null): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ firstName })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  async getPropertiesByUserId(userId: string): Promise<Property[]> {
    return db.select().from(properties)
      .where(and(eq(properties.userId, userId), eq(properties.isActive, true)))
      .orderBy(properties.createdAt);
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [created] = await db.insert(properties).values(property).returning();
    return created;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db.update(properties)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  async softDeleteProperty(id: string): Promise<void> {
    await db.update(properties)
      .set({ isActive: false, updatedAt: new Date().toISOString() })
      .where(eq(properties.id, id));
  }

  async getAllTerms(activeOnly = true): Promise<ComplianceTerm[]> {
    if (activeOnly) {
      return db.select().from(complianceTerms).where(eq(complianceTerms.isActive, true)).orderBy(complianceTerms.term);
    }
    return db.select().from(complianceTerms).orderBy(complianceTerms.term);
  }

  async getTermBySlug(slug: string): Promise<ComplianceTerm | undefined> {
    const [term] = await db.select().from(complianceTerms).where(eq(complianceTerms.slug, slug));
    return term;
  }

  async getTermById(id: string): Promise<ComplianceTerm | undefined> {
    const [term] = await db.select().from(complianceTerms).where(eq(complianceTerms.id, id));
    return term;
  }

  async searchTerms(query: string, tags?: string[]): Promise<ComplianceTerm[]> {
    const pattern = `%${query}%`;
    let results = await db.select().from(complianceTerms)
      .where(
        sql`${complianceTerms.isActive} = true AND (
          ${complianceTerms.term} ILIKE ${pattern} OR
          ${complianceTerms.plainDefinition} ILIKE ${pattern} OR
          EXISTS (SELECT 1 FROM json_array_elements_text(${complianceTerms.tags}) AS t WHERE t ILIKE ${pattern})
        )`
      )
      .orderBy(complianceTerms.term);

    if (tags && tags.length > 0) {
      results = results.filter(term => {
        const termTags = term.tags as string[];
        return tags.some(tag => termTags.includes(tag));
      });
    }

    return results;
  }

  async createTerm(term: InsertComplianceTerm): Promise<ComplianceTerm> {
    const [created] = await db.insert(complianceTerms).values(term as any).returning();
    return created;
  }

  async updateTerm(id: string, updates: Partial<InsertComplianceTerm>): Promise<ComplianceTerm | undefined> {
    const [updated] = await db.update(complianceTerms).set(updates as any).where(eq(complianceTerms.id, id)).returning();
    return updated;
  }

  async getAllGuides(activeOnly = true): Promise<ProcessGuide[]> {
    if (activeOnly) {
      return db.select().from(processNavigationGuides).where(eq(processNavigationGuides.isActive, true)).orderBy(processNavigationGuides.gateNumber);
    }
    return db.select().from(processNavigationGuides).orderBy(processNavigationGuides.gateNumber);
  }

  async getGuideById(id: string): Promise<ProcessGuide | undefined> {
    const [guide] = await db.select().from(processNavigationGuides).where(eq(processNavigationGuides.id, id));
    return guide;
  }

  async createGuide(guide: InsertProcessGuide): Promise<ProcessGuide> {
    const [created] = await db.insert(processNavigationGuides).values(guide as any).returning();
    return created;
  }

  async updateGuide(id: string, updates: Partial<InsertProcessGuide>): Promise<ProcessGuide | undefined> {
    const [updated] = await db.update(processNavigationGuides).set(updates as any).where(eq(processNavigationGuides.id, id)).returning();
    return updated;
  }

  async getAllTemplates(): Promise<VaultDocumentTemplate[]> {
    return db.select().from(vaultDocumentTemplates)
      .where(eq(vaultDocumentTemplates.isActive, true))
      .orderBy(vaultDocumentTemplates.gateNumber);
  }

  async getVaultDocumentsByProperty(propertyId: string): Promise<VaultDocument[]> {
    return db.select().from(vaultDocuments)
      .where(eq(vaultDocuments.propertyId, propertyId));
  }

  async getVaultDocumentById(id: string): Promise<VaultDocument | undefined> {
    const [doc] = await db.select().from(vaultDocuments).where(eq(vaultDocuments.id, id));
    return doc;
  }

  async upsertVaultDocument(doc: InsertVaultDocument): Promise<VaultDocument> {
    const existing = await db.select().from(vaultDocuments)
      .where(and(
        eq(vaultDocuments.propertyId, doc.propertyId),
        eq(vaultDocuments.templateId, doc.templateId),
      ));
    if (existing.length > 0) {
      const [updated] = await db.update(vaultDocuments)
        .set({ ...doc, updatedAt: new Date().toISOString() })
        .where(eq(vaultDocuments.id, existing[0].id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(vaultDocuments)
      .values({ ...doc, updatedAt: new Date().toISOString() })
      .returning();
    return created;
  }

  async getVaultDocumentByPropertyAndTemplate(propertyId: string, templateId: string): Promise<VaultDocument | undefined> {
    const [doc] = await db.select().from(vaultDocuments)
      .where(and(
        eq(vaultDocuments.propertyId, propertyId),
        eq(vaultDocuments.templateId, templateId),
      ));
    return doc;
  }

  async getVaultDocumentByFileUrl(fileUrl: string): Promise<VaultDocument | undefined> {
    const [doc] = await db.select().from(vaultDocuments)
      .where(eq(vaultDocuments.fileUrl, fileUrl));
    return doc;
  }

  async updateVaultDocument(id: string, updates: Partial<InsertVaultDocument>): Promise<VaultDocument | undefined> {
    const [updated] = await db.update(vaultDocuments)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(vaultDocuments.id, id))
      .returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserAdmin(id: string, isAdmin: boolean): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ isAdmin })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserProWithGranter(id: string, isPro: boolean, granterId: string): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({
        isPro,
        proGrantedAt: isPro ? new Date().toISOString() : null,
        proGrantedBy: isPro ? granterId : null,
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getSupportGrant(userId: string): Promise<SupportAccessGrant | undefined> {
    const [grant] = await db.select().from(supportAccessGrants)
      .where(eq(supportAccessGrants.userId, userId));
    return grant;
  }

  async createOrReactivateSupportGrant(userId: string): Promise<SupportAccessGrant> {
    const existing = await this.getSupportGrant(userId);
    if (existing) {
      const [updated] = await db.update(supportAccessGrants)
        .set({ isActive: true, revokedAt: null, grantedAt: new Date().toISOString() })
        .where(eq(supportAccessGrants.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(supportAccessGrants)
      .values({ userId, grantedAt: new Date().toISOString(), isActive: true })
      .returning();
    return created;
  }

  async revokeSupportGrant(userId: string): Promise<void> {
    await db.update(supportAccessGrants)
      .set({ isActive: false, revokedAt: new Date().toISOString() })
      .where(and(eq(supportAccessGrants.userId, userId), eq(supportAccessGrants.isActive, true)));
  }

  async updateSupportGrantAccess(userId: string, adminId: string): Promise<void> {
    await db.update(supportAccessGrants)
      .set({ lastAccessedAt: new Date().toISOString(), lastAccessedBy: adminId })
      .where(and(eq(supportAccessGrants.userId, userId), eq(supportAccessGrants.isActive, true)));
  }

  async createAccessLogEntry(adminId: string, targetUserId: string, action: string, metadata?: Record<string, string>): Promise<AdminAccessLogEntry> {
    const [entry] = await db.insert(adminAccessLog)
      .values({ adminId, targetUserId, action, timestamp: new Date().toISOString(), metadata: metadata || null })
      .returning();
    return entry;
  }

  async getAccessLog(limit: number, offset: number): Promise<Array<AdminAccessLogEntry & { adminEmail?: string; targetEmail?: string }>> {
    const rows = await db
      .select()
      .from(adminAccessLog)
      .orderBy(desc(adminAccessLog.timestamp))
      .limit(limit)
      .offset(offset);

    const userIds = Array.from(new Set(rows.flatMap(r => [r.adminId, r.targetUserId])));
    const userRows = userIds.length > 0
      ? await db.select({ id: users.id, email: users.email }).from(users).where(sql`${users.id} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)
      : [];
    const emailMap = new Map(userRows.map(u => [u.id, u.email]));

    return rows.map(r => ({
      ...r,
      adminEmail: emailMap.get(r.adminId),
      targetEmail: emailMap.get(r.targetUserId),
    }));
  }

  async getActiveGrantUserIds(): Promise<string[]> {
    const rows = await db.select({ userId: supportAccessGrants.userId })
      .from(supportAccessGrants)
      .where(eq(supportAccessGrants.isActive, true));
    return rows.map(r => r.userId);
  }

  async getPropertyCountsByUserIds(): Promise<Map<string, number>> {
    const rows = await db.select({
      userId: properties.userId,
      count: count(),
    }).from(properties)
      .where(eq(properties.isActive, true))
      .groupBy(properties.userId);
    return new Map(rows.map(r => [r.userId, r.count]));
  }

  async getBanjarContributions(propertyId: string): Promise<BanjarContribution[]> {
    return db.select().from(banjarContributions)
      .where(eq(banjarContributions.propertyId, propertyId))
      .orderBy(desc(banjarContributions.contributionDate));
  }

  async createBanjarContribution(contrib: InsertBanjarContribution): Promise<BanjarContribution> {
    const [created] = await db.insert(banjarContributions).values(contrib).returning();
    return created;
  }

  async deleteBanjarContribution(id: string): Promise<void> {
    await db.delete(banjarContributions).where(eq(banjarContributions.id, id));
  }

  async getStaffMembers(propertyId: string): Promise<StaffMember[]> {
    return db.select().from(staffMembers)
      .where(eq(staffMembers.propertyId, propertyId))
      .orderBy(staffMembers.name);
  }

  async createStaffMember(staff: InsertStaffMember): Promise<StaffMember> {
    const [created] = await db.insert(staffMembers).values(staff).returning();
    return created;
  }

  async updateStaffMember(id: string, updates: Partial<InsertStaffMember>): Promise<StaffMember | undefined> {
    const [updated] = await db.update(staffMembers).set(updates).where(eq(staffMembers.id, id)).returning();
    return updated;
  }

  async deleteStaffMember(id: string): Promise<void> {
    await db.delete(staffMembers).where(eq(staffMembers.id, id));
  }

  async getRecurringFilings(propertyId: string): Promise<RecurringFiling[]> {
    return db.select().from(recurringFilings)
      .where(eq(recurringFilings.propertyId, propertyId))
      .orderBy(recurringFilings.dueDate);
  }

  async createRecurringFiling(filing: InsertRecurringFiling): Promise<RecurringFiling> {
    const [created] = await db.insert(recurringFilings).values(filing).returning();
    return created;
  }

  async updateRecurringFiling(id: string, updates: Partial<InsertRecurringFiling>): Promise<RecurringFiling | undefined> {
    const [updated] = await db.update(recurringFilings)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(recurringFilings.id, id))
      .returning();
    return updated;
  }

  async deleteRecurringFiling(id: string): Promise<void> {
    await db.delete(recurringFilings).where(eq(recurringFilings.id, id));
  }

  async getUpdatePreferences(userId: string): Promise<UpdatePreferences | undefined> {
    const [prefs] = await db.select().from(updatePreferences).where(eq(updatePreferences.userId, userId));
    return prefs;
  }

  async upsertUpdatePreferences(userId: string, prefs: Partial<InsertUpdatePreferences>): Promise<UpdatePreferences> {
    const existing = await this.getUpdatePreferences(userId);
    if (existing) {
      const [updated] = await db.update(updatePreferences)
        .set({ ...prefs, updatedAt: new Date().toISOString() })
        .where(eq(updatePreferences.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(updatePreferences)
      .values({ userId, ...prefs })
      .returning();
    return created;
  }

  async getUserNotifications(userId: string): Promise<UserNotification[]> {
    return db.select().from(userNotifications)
      .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isDismissed, false)))
      .orderBy(desc(userNotifications.createdAt));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(userNotifications)
      .where(and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false),
        eq(userNotifications.isDismissed, false),
      ));
    return result?.count ?? 0;
  }

  async getNotificationById(id: string): Promise<UserNotification | undefined> {
    const [notif] = await db.select().from(userNotifications).where(eq(userNotifications.id, id));
    return notif;
  }

  async createUserNotification(notif: InsertUserNotification): Promise<UserNotification> {
    const [created] = await db.insert(userNotifications).values(notif).returning();
    return created;
  }

  async markNotificationRead(id: string, userId: string): Promise<void> {
    await db.update(userNotifications)
      .set({ isRead: true })
      .where(and(eq(userNotifications.id, id), eq(userNotifications.userId, userId)));
  }

  async dismissNotification(id: string, userId: string): Promise<void> {
    await db.update(userNotifications)
      .set({ isDismissed: true, isRead: true })
      .where(and(eq(userNotifications.id, id), eq(userNotifications.userId, userId)));
  }

  async getRegulatoryChanges(): Promise<RegulatoryChange[]> {
    return db.select().from(regulatoryChanges).orderBy(desc(regulatoryChanges.createdAt));
  }

  async getRegulatoryChangeById(id: string): Promise<RegulatoryChange | undefined> {
    const [change] = await db.select().from(regulatoryChanges).where(eq(regulatoryChanges.id, id));
    return change;
  }

  async createRegulatoryChange(change: InsertRegulatoryChange): Promise<RegulatoryChange> {
    const [created] = await db.insert(regulatoryChanges).values(change as any).returning();
    return created;
  }

  async updateRegulatoryChange(id: string, updates: Partial<RegulatoryChange>): Promise<RegulatoryChange | undefined> {
    const [updated] = await db.update(regulatoryChanges)
      .set(updates)
      .where(eq(regulatoryChanges.id, id))
      .returning();
    return updated;
  }

  async getVaultTemplateBySlug(slug: string): Promise<VaultDocumentTemplate | undefined> {
    const [template] = await db.select().from(vaultDocumentTemplates)
      .where(eq(vaultDocumentTemplates.documentSlug, slug));
    return template;
  }

  async createVaultDocumentTemplate(template: InsertVaultDocumentTemplate): Promise<VaultDocumentTemplate> {
    const [created] = await db.insert(vaultDocumentTemplates).values(template).returning();
    return created;
  }

  async getRecurringFilingById(id: string): Promise<RecurringFiling | undefined> {
    const [filing] = await db.select().from(recurringFilings).where(eq(recurringFilings.id, id));
    return filing;
  }

  async getAllCalendarEventTemplates(activeOnly?: boolean): Promise<CalendarEventTemplate[]> {
    if (activeOnly) {
      return db.select().from(calendarEventTemplates)
        .where(eq(calendarEventTemplates.isActive, true))
        .orderBy(calendarEventTemplates.sortOrder);
    }
    return db.select().from(calendarEventTemplates).orderBy(calendarEventTemplates.sortOrder);
  }

  async getCalendarEventTemplateById(id: string): Promise<CalendarEventTemplate | undefined> {
    const [template] = await db.select().from(calendarEventTemplates).where(eq(calendarEventTemplates.id, id));
    return template;
  }

  async getCalendarEventTemplateByKey(eventKey: string): Promise<CalendarEventTemplate | undefined> {
    const [template] = await db.select().from(calendarEventTemplates).where(eq(calendarEventTemplates.eventKey, eventKey));
    return template;
  }

  async createCalendarEventTemplate(template: InsertCalendarEventTemplate): Promise<CalendarEventTemplate> {
    const [created] = await db.insert(calendarEventTemplates).values(template as any).returning();
    return created;
  }

  async updateCalendarEventTemplate(id: string, updates: Partial<InsertCalendarEventTemplate>): Promise<CalendarEventTemplate | undefined> {
    const [updated] = await db.update(calendarEventTemplates).set(updates as any).where(eq(calendarEventTemplates.id, id)).returning();
    return updated;
  }

  async deleteCalendarEventTemplate(id: string): Promise<void> {
    await db.delete(calendarEventTemplates).where(eq(calendarEventTemplates.id, id));
  }
}

export const storage = new DatabaseStorage();
