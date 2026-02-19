import { type User, type InsertUser, type ComplianceTerm, type InsertComplianceTerm, type ProcessGuide, type InsertProcessGuide, complianceTerms, processNavigationGuides } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { users } = await import("@shared/schema");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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
}

export const storage = new DatabaseStorage();
