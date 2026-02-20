import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertComplianceTermSchema, insertProcessGuideSchema, insertPropertySchema, insertVaultDocumentSchema } from "@shared/schema";
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

    const { email, password } = parsed.data;

    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "emailTaken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      username: null,
    });

    req.session.userId = user.id;
    res.status(201).json({ id: user.id, email: user.email, isAdmin: user.isAdmin, isPro: user.isPro || user.isAdmin });
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
    res.json({ id: user.id, email: user.email, isAdmin: user.isAdmin, isPro: user.isPro || user.isAdmin });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ id: user.id, email: user.email, isAdmin: user.isAdmin, isPro: user.isPro || user.isAdmin });
  });

  async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUserById(req.session.userId);
    if (!user?.isAdmin) return res.status(403).json({ message: "Forbidden" });
    next();
  }

  app.patch("/api/admin/users/:id/pro", requireAuth, requireAdmin, async (req, res) => {
    const { isPro } = req.body;
    if (typeof isPro !== "boolean") {
      return res.status(400).json({ message: "isPro must be a boolean" });
    }
    const updated = await storage.updateUserPro(req.params.id, isPro);
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ id: updated.id, email: updated.email, isAdmin: updated.isAdmin, isPro: updated.isPro || updated.isAdmin });
  });

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

  return httpServer;
}
