import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertComplianceTermSchema, insertProcessGuideSchema, insertPropertySchema, insertVaultDocumentSchema, insertBanjarContributionSchema, insertRecurringFilingSchema, insertStaffMemberSchema } from "@shared/schema";
import { seedComplianceTerms } from "./seed";
import { seedVaultTemplates } from "./seed-vault";
import bcrypt from "bcrypt";
import { z } from "zod";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
  next();
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedComplianceTerms();
  await seedVaultTemplates();

  app.post("/api/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const { email, password, firstName } = parsed.data;

    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "emailTaken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      username: null,
      firstName: firstName || null,
    });

    req.session.userId = user.id;
    res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName, isAdmin: user.isAdmin, isPro: user.isPro || user.isAdmin });
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const { email, password } = parsed.data;

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "loginError" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "loginError" });
    }

    await storage.updateUserLastLogin(user.id);
    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email, firstName: user.firstName, isAdmin: user.isAdmin, isPro: user.isPro || user.isAdmin });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.json({ ok: true });
    });
  });

  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    const schema = z.object({ firstName: z.string().max(50).nullable() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const user = await storage.updateUserFirstName(req.session.userId!, parsed.data.firstName);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, email: user.email, firstName: user.firstName, isAdmin: user.isAdmin, isPro: user.isPro || user.isAdmin });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ id: user.id, email: user.email, firstName: user.firstName, isAdmin: user.isAdmin, isPro: user.isPro || user.isAdmin });
  });

  async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUserById(req.session.userId);
    if (!user?.isAdmin) return res.status(403).json({ message: "Forbidden" });
    next();
  }

  app.get("/api/properties", requireAuth, async (req, res) => {
    const props = await storage.getPropertiesByUserId(req.session.userId!);
    res.json(props);
  });

  app.post("/api/properties", requireAuth, async (req, res) => {
    const parsed = insertPropertySchema.safeParse({
      ...req.body,
      userId: req.session.userId,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    }
    const property = await storage.createProperty(parsed.data);
    res.status(201).json(property);
  });

  app.patch("/api/properties/:id", requireAuth, async (req, res) => {
    const property = await storage.getPropertyById(req.params.id);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }

    const { userId, ...body } = req.body;
    const updateSchema = insertPropertySchema.partial().omit({ userId: true });
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    }

    const updated = await storage.updateProperty(req.params.id, parsed.data);
    res.json(updated);
  });

  app.delete("/api/properties/:id", requireAuth, async (req, res) => {
    const property = await storage.getPropertyById(req.params.id);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }

    await storage.softDeleteProperty(req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/terms", async (_req, res) => {
    const activeOnly = _req.query.activeOnly !== "false";
    const terms = await storage.getAllTerms(activeOnly);
    res.json(terms);
  });

  app.get("/api/terms/search", async (req, res) => {
    const query = (req.query.q as string) || "";
    const tagsParam = req.query.tags as string | undefined;
    const tags = tagsParam ? tagsParam.split(",") : undefined;
    const terms = await storage.searchTerms(query, tags);
    res.json(terms);
  });

  app.get("/api/terms/:id", async (req, res) => {
    const term = await storage.getTermById(req.params.id);
    if (!term) return res.status(404).json({ message: "Term not found" });
    res.json(term);
  });

  app.post("/api/terms", async (req, res) => {
    const parsed = insertComplianceTermSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    }
    const term = await storage.createTerm(parsed.data);
    res.status(201).json(term);
  });

  app.patch("/api/terms/:id", async (req, res) => {
    const existing = await storage.getTermById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Term not found" });

    const updateSchema = insertComplianceTermSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    }

    const updated = await storage.updateTerm(req.params.id, parsed.data);
    res.json(updated);
  });

  app.get("/api/guides", async (_req, res) => {
    const activeOnly = _req.query.activeOnly !== "false";
    const guides = await storage.getAllGuides(activeOnly);
    res.json(guides);
  });

  app.get("/api/guides/:id", async (req, res) => {
    const guide = await storage.getGuideById(req.params.id);
    if (!guide) return res.status(404).json({ message: "Guide not found" });
    res.json(guide);
  });

  app.post("/api/guides", async (req, res) => {
    const parsed = insertProcessGuideSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    }
    const guide = await storage.createGuide(parsed.data);
    res.status(201).json(guide);
  });

  app.patch("/api/guides/:id", async (req, res) => {
    const existing = await storage.getGuideById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Guide not found" });

    const updateSchema = insertProcessGuideSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    }

    const updated = await storage.updateGuide(req.params.id, parsed.data);
    res.json(updated);
  });

  app.get("/api/vault/templates", async (_req, res) => {
    const templates = await storage.getAllTemplates();
    res.json(templates);
  });

  app.get("/api/vault/summary", requireAuth, async (req, res) => {
    const propertyId = req.query.propertyId as string;
    if (!propertyId) return res.status(400).json({ message: "propertyId required" });

    const property = await storage.getPropertyById(propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }

    const templates = await storage.getAllTemplates();
    const docs = await storage.getVaultDocumentsByProperty(propertyId);
    const today = new Date();
    const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const docMap = new Map(docs.map(d => [d.templateId, d]));
    let uploaded = 0, missing = 0, expiring = 0, expired = 0;
    const gateStats = new Map<number, { total: number; done: number }>();

    for (const tmpl of templates) {
      const gs = gateStats.get(tmpl.gateNumber) || { total: 0, done: 0 };
      if (tmpl.isRequired) gs.total++;
      const doc = docMap.get(tmpl.id);
      let status = doc?.status || "missing";
      if (doc?.expiryDate) {
        const exp = new Date(doc.expiryDate);
        if (exp < today) status = "expired";
        else if (exp < ninetyDays) status = "expiring";
      }
      if (status === "uploaded") { uploaded++; if (tmpl.isRequired) gs.done++; }
      else if (status === "expiring") { expiring++; if (tmpl.isRequired) gs.done++; }
      else if (status === "expired") { expired++; }
      else { missing++; }
      gateStats.set(tmpl.gateNumber, gs);
    }

    const total = templates.length;
    const requiredTotal = templates.filter(t => t.isRequired).length;
    const requiredDone = uploaded + expiring;
    const completionPct = requiredTotal > 0 ? Math.round((requiredDone / requiredTotal) * 100) : 0;
    const gateCompletions = Array.from(gateStats.entries()).map(([gateNumber, s]) => ({
      gateNumber,
      pct: s.total > 0 ? Math.round((s.done / s.total) * 100) : 100,
    })).sort((a, b) => a.gateNumber - b.gateNumber);

    res.json({ total, uploaded, missing, expiring, expired, completionPct, gateCompletions });
  });

  app.get("/api/vault", requireAuth, async (req, res) => {
    const propertyId = req.query.propertyId as string;
    if (!propertyId) return res.status(400).json({ message: "propertyId required" });

    const property = await storage.getPropertyById(propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }

    const docs = await storage.getVaultDocumentsByProperty(propertyId);
    const today = new Date();
    const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const computed = docs.map(doc => {
      let status = doc.status;
      if (doc.expiryDate) {
        const exp = new Date(doc.expiryDate);
        if (exp < today) status = "expired";
        else if (exp < ninetyDays) status = "expiring";
      }
      return { ...doc, status };
    });
    res.json(computed);
  });

  app.post("/api/vault", requireAuth, async (req, res) => {
    const { propertyId, templateId, status, expiryDate, fileUrl, notes } = req.body;
    if (!propertyId || !templateId) {
      return res.status(400).json({ message: "propertyId and templateId required" });
    }

    const property = await storage.getPropertyById(propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }

    const doc = await storage.upsertVaultDocument({
      propertyId,
      templateId,
      status: status || "missing",
      expiryDate: expiryDate || null,
      uploadedAt: status === "uploaded" ? new Date().toISOString() : null,
      fileUrl: fileUrl || null,
      notes: notes || null,
      updatedAt: new Date().toISOString(),
    });
    res.json(doc);
  });

  app.patch("/api/vault/:id", requireAuth, async (req, res) => {
    const doc = await storage.getVaultDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const property = await storage.getPropertyById(doc.propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }

    const { propertyId, templateId, ...body } = req.body;
    const updated = await storage.updateVaultDocument(req.params.id, body);
    res.json(updated);
  });

  // === User-facing support access routes ===
  app.get("/api/support-access", requireAuth, async (req, res) => {
    const grant = await storage.getSupportGrant(req.session.userId!);
    res.json({ isActive: grant?.isActive ?? false, grantedAt: grant?.grantedAt, lastAccessedAt: grant?.lastAccessedAt, lastAccessedBy: grant?.lastAccessedBy });
  });

  app.post("/api/support-access/grant", requireAuth, async (req, res) => {
    const grant = await storage.createOrReactivateSupportGrant(req.session.userId!);
    res.json({ isActive: grant.isActive, grantedAt: grant.grantedAt });
  });

  app.post("/api/support-access/revoke", requireAuth, async (req, res) => {
    await storage.revokeSupportGrant(req.session.userId!);
    res.json({ isActive: false });
  });

  // === Admin user management routes ===
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const activeGrantIds = await storage.getActiveGrantUserIds();
    const activeGrantSet = new Set(activeGrantIds);
    const propCounts = await storage.getPropertyCountsByUserIds();

    const result = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      isAdmin: u.isAdmin,
      isPro: u.isPro || u.isAdmin,
      proGrantedAt: u.proGrantedAt,
      proGrantedBy: u.proGrantedBy,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      hasSupportAccess: activeGrantSet.has(u.id),
      propertyCount: propCounts.get(u.id) || 0,
    }));

    await storage.createAccessLogEntry(req.session.userId!, req.session.userId!, "view_user_list");
    res.json(result);
  });

  app.patch("/api/admin/users/:id/admin", requireAuth, requireAdmin, async (req, res) => {
    const { isAdmin } = req.body;
    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ message: "isAdmin must be a boolean" });
    }
    if (req.params.id === req.session.userId) {
      return res.status(400).json({ message: "Cannot change own admin status" });
    }
    const updated = await storage.updateUserAdmin(req.params.id, isAdmin);
    if (!updated) return res.status(404).json({ message: "User not found" });

    await storage.createAccessLogEntry(req.session.userId!, req.params.id, isAdmin ? "grant_admin" : "revoke_admin");
    res.json({ id: updated.id, email: updated.email, isAdmin: updated.isAdmin, isPro: updated.isPro || updated.isAdmin });
  });

  app.patch("/api/admin/users/:id/pro", requireAuth, requireAdmin, async (req, res) => {
    const { isPro } = req.body;
    if (typeof isPro !== "boolean") {
      return res.status(400).json({ message: "isPro must be a boolean" });
    }
    const updated = await storage.updateUserProWithGranter(req.params.id, isPro, req.session.userId!);
    if (!updated) return res.status(404).json({ message: "User not found" });

    await storage.createAccessLogEntry(req.session.userId!, req.params.id, isPro ? "grant_pro" : "revoke_pro");
    res.json({ id: updated.id, email: updated.email, isAdmin: updated.isAdmin, isPro: updated.isPro || updated.isAdmin });
  });

  // === Admin support mode enter/exit ===
  app.post("/api/admin/support/enter/:userId", requireAuth, requireAdmin, async (req, res) => {
    const grant = await storage.getSupportGrant(req.params.userId);
    if (!grant?.isActive) {
      return res.status(403).json({ message: "User has not granted support access" });
    }
    await storage.updateSupportGrantAccess(req.params.userId, req.session.userId!);
    await storage.createAccessLogEntry(req.session.userId!, req.params.userId, "enter_support_mode");
    req.session.supportUserId = req.params.userId;
    res.json({ ok: true, targetUserId: req.params.userId });
  });

  app.post("/api/admin/support/exit", requireAuth, requireAdmin, async (req, res) => {
    if (req.session.supportUserId) {
      await storage.createAccessLogEntry(req.session.userId!, req.session.supportUserId, "exit_support_mode");
      delete req.session.supportUserId;
    }
    res.json({ ok: true });
  });

  app.get("/api/admin/support/status", requireAuth, requireAdmin, async (req, res) => {
    if (!req.session.supportUserId) {
      return res.json({ active: false });
    }
    const targetUser = await storage.getUser(req.session.supportUserId);
    res.json({ active: true, targetUserId: req.session.supportUserId, targetEmail: targetUser?.email });
  });

  // === Admin access log ===
  app.get("/api/admin/access-log", requireAuth, requireAdmin, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const entries = await storage.getAccessLog(limit, offset);
    res.json(entries);
  });

  // === Support-mode aware property/vault access ===
  // When admin is in support mode, they can view the target user's data (read-only)
  app.get("/api/admin/support/properties", requireAuth, requireAdmin, async (req, res) => {
    if (!req.session.supportUserId) {
      return res.status(400).json({ message: "Not in support mode" });
    }
    const grant = await storage.getSupportGrant(req.session.supportUserId);
    if (!grant?.isActive) {
      delete req.session.supportUserId;
      return res.status(403).json({ message: "Support access revoked" });
    }
    const props = await storage.getPropertiesByUserId(req.session.supportUserId);
    await storage.createAccessLogEntry(req.session.userId!, req.session.supportUserId, "view_properties");
    res.json(props);
  });

  app.get("/api/admin/support/vault", requireAuth, requireAdmin, async (req, res) => {
    if (!req.session.supportUserId) {
      return res.status(400).json({ message: "Not in support mode" });
    }
    const grant = await storage.getSupportGrant(req.session.supportUserId);
    if (!grant?.isActive) {
      delete req.session.supportUserId;
      return res.status(403).json({ message: "Support access revoked" });
    }
    const propertyId = req.query.propertyId as string;
    if (!propertyId) return res.status(400).json({ message: "propertyId required" });

    const property = await storage.getPropertyById(propertyId);
    if (!property || property.userId !== req.session.supportUserId) {
      return res.status(404).json({ message: "Property not found" });
    }

    const docs = await storage.getVaultDocumentsByProperty(propertyId);
    const today = new Date();
    const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const computed = docs.map(doc => {
      let status = doc.status;
      if (doc.expiryDate) {
        const exp = new Date(doc.expiryDate);
        if (exp < today) status = "expired";
        else if (exp < ninetyDays) status = "expiring";
      }
      return { ...doc, status };
    });

    await storage.createAccessLogEntry(req.session.userId!, req.session.supportUserId, "view_vault", { propertyId });
    res.json(computed);
  });

  app.get("/api/vault/report", requireAuth, async (req, res) => {
    const propertyId = req.query.propertyId as string;
    if (!propertyId) return res.status(400).json({ message: "propertyId required" });

    const property = await storage.getPropertyById(propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }

    const templates = await storage.getAllTemplates();
    const docs = await storage.getVaultDocumentsByProperty(propertyId);
    const today = new Date();
    const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const docMap = new Map(docs.map(d => [d.templateId, d]));

    const gateAbbrs = ["PT PMA", "ZONE/KKPR", "NIB/KBLI", "PBG/SLF", "TAX", "STAFF", "SAFETY", "OTA"];

    const rows: string[] = [];
    rows.push("Gate,Document,Required,Status,Expiry Date,Notes");

    for (const tmpl of templates) {
      const doc = docMap.get(tmpl.id);
      let status = doc?.status || "missing";
      if (doc?.expiryDate) {
        const exp = new Date(doc.expiryDate);
        if (exp < today) status = "expired";
        else if (exp < ninetyDays) status = "expiring";
      }

      const tr = tmpl.translations as Record<string, { name: string }>;
      const name = tr?.en?.name || "";
      const gate = `Gate ${tmpl.gateNumber} - ${gateAbbrs[tmpl.gateNumber] || ""}`;
      const required = tmpl.isRequired ? "Yes" : "No";
      const expiry = doc?.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "";
      const notes = (doc?.notes || "").replace(/"/g, '""');

      rows.push(`"${gate}","${name}","${required}","${status}","${expiry}","${notes}"`);
    }

    const csv = rows.join("\n");
    const filename = `DSCVR_Compliance_Report_${property.propertyName.replace(/[^a-zA-Z0-9]/g, "_")}_${today.toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  });

  // === Banjar contributions ===
  app.get("/api/banjar-contributions", requireAuth, async (req, res) => {
    const propertyId = req.query.propertyId as string;
    if (!propertyId) return res.status(400).json({ message: "propertyId required" });
    const property = await storage.getPropertyById(propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }
    const contributions = await storage.getBanjarContributions(propertyId);
    res.json(contributions);
  });

  app.post("/api/banjar-contributions", requireAuth, async (req, res) => {
    const parsed = insertBanjarContributionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const property = await storage.getPropertyById(parsed.data.propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }
    const contrib = await storage.createBanjarContribution(parsed.data);
    res.status(201).json(contrib);
  });

  app.delete("/api/banjar-contributions/:id", requireAuth, async (req, res) => {
    await storage.deleteBanjarContribution(req.params.id);
    res.json({ ok: true });
  });

  // === Staff members ===
  app.get("/api/staff", requireAuth, async (req, res) => {
    const propertyId = req.query.propertyId as string;
    if (!propertyId) return res.status(400).json({ message: "propertyId required" });
    const property = await storage.getPropertyById(propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }
    const staff = await storage.getStaffMembers(propertyId);
    res.json(staff);
  });

  app.post("/api/staff", requireAuth, async (req, res) => {
    const parsed = insertStaffMemberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const property = await storage.getPropertyById(parsed.data.propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }
    const staff = await storage.createStaffMember(parsed.data);
    res.status(201).json(staff);
  });

  app.patch("/api/staff/:id", requireAuth, async (req, res) => {
    const { propertyId, ...body } = req.body;
    const updated = await storage.updateStaffMember(req.params.id, body);
    if (!updated) return res.status(404).json({ message: "Staff member not found" });
    res.json(updated);
  });

  app.delete("/api/staff/:id", requireAuth, async (req, res) => {
    await storage.deleteStaffMember(req.params.id);
    res.json({ ok: true });
  });

  // === Recurring filings ===
  app.get("/api/filings", requireAuth, async (req, res) => {
    const propertyId = req.query.propertyId as string;
    if (!propertyId) return res.status(400).json({ message: "propertyId required" });
    const property = await storage.getPropertyById(propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }
    const filings = await storage.getRecurringFilings(propertyId);
    res.json(filings);
  });

  app.post("/api/filings", requireAuth, async (req, res) => {
    const parsed = insertRecurringFilingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const property = await storage.getPropertyById(parsed.data.propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(404).json({ message: "Property not found" });
    }
    const filing = await storage.createRecurringFiling(parsed.data);
    res.status(201).json(filing);
  });

  app.patch("/api/filings/:id", requireAuth, async (req, res) => {
    const { propertyId, ...body } = req.body;
    const updated = await storage.updateRecurringFiling(req.params.id, body);
    if (!updated) return res.status(404).json({ message: "Filing not found" });
    res.json(updated);
  });

  app.delete("/api/filings/:id", requireAuth, async (req, res) => {
    await storage.deleteRecurringFiling(req.params.id);
    res.json({ ok: true });
  });

  return httpServer;
}
