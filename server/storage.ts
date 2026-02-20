import {
  type User, type InsertUser,
  type ComplianceTerm, type InsertComplianceTerm,
  type ProcessGuide, type InsertProcessGuide,
  type Property, type InsertProperty,
  type VaultDocumentTemplate,
  type VaultDocument, type InsertVaultDocument,
  users, complianceTerms, processNavigationGuides, properties,
  vaultDocumentTemplates, vaultDocuments,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  getUserById(id: string): Promise<User | undefined>;
  updateUserPro(id: string, isPro: boolean): Promise<User | undefined>;

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
    const [created] = await db.insert(complianceTerms).values(term).returning();
    return created;
  }

  async updateTerm(id: string, updates: Partial<InsertComplianceTerm>): Promise<ComplianceTerm | undefined> {
    const [updated] = await db.update(complianceTerms).set(updates).where(eq(complianceTerms.id, id)).returning();
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
    const [created] = await db.insert(processNavigationGuides).values(guide).returning();
    return created;
  }

  async updateGuide(id: string, updates: Partial<InsertProcessGuide>): Promise<ProcessGuide | undefined> {
    const [updated] = await db.update(processNavigationGuides).set(updates).where(eq(processNavigationGuides.id, id)).returning();
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

  async updateVaultDocument(id: string, updates: Partial<InsertVaultDocument>): Promise<VaultDocument | undefined> {
    const [updated] = await db.update(vaultDocuments)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(vaultDocuments.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
