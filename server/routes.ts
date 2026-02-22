import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertComplianceTermSchema, insertProcessGuideSchema, insertPropertySchema, insertVaultDocumentSchema, insertBanjarContributionSchema, insertRecurringFilingSchema, insertStaffMemberSchema, insertCalendarEventTemplateSchema } from "@shared/schema";
import { seedComplianceTerms, seedAdminUser } from "./seed";
import { seedVaultTemplates } from "./seed-vault";
import { seedCalendarEventTemplates } from "./seed-calendar-templates";
import bcrypt from "bcrypt";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("File type not allowed"));
  },
});

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
  try { await seedAdminUser(); } catch (e) { console.error("Admin seed error:", e); }
  try { await seedComplianceTerms(); } catch (e) { console.error("Compliance terms seed error:", e); }
  try { await seedVaultTemplates(); } catch (e) { console.error("Vault templates seed error:", e); }
  try { await seedCalendarEventTemplates(); } catch (e) { console.error("Calendar templates seed error:", e); }

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

  app.post("/api/vault/upload", requireAuth, upload.single("file"), async (req, res) => {
    try {
      const { propertyId, templateId } = req.body;
      if (!propertyId || !templateId) return res.status(400).json({ message: "propertyId and templateId required" });

      const property = await storage.getPropertyById(propertyId);
      if (!property || property.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!req.file) return res.status(400).json({ message: "No file provided" });

      let doc = await storage.getVaultDocumentByPropertyAndTemplate(propertyId, templateId);
      if (!doc) {
        doc = await storage.upsertVaultDocument({
          propertyId,
          templateId,
          status: "missing",
          uploadedAt: null,
          fileUrl: null,
          fileName: null,
          fileSize: null,
          notes: null,
          updatedAt: new Date().toISOString(),
        });
      }

      if (doc.fileUrl) {
        const oldPath = path.join(UPLOADS_DIR, path.basename(doc.fileUrl));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const updated = await storage.updateVaultDocument(doc.id, {
        fileUrl: `/api/vault/files/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        status: "uploaded",
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Upload failed" });
    }
  });

  app.get("/api/vault/files/:filename", requireAuth, async (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

    const fileUrl = `/api/vault/files/${filename}`;
    const doc = await storage.getVaultDocumentByFileUrl(fileUrl);
    if (!doc) return res.status(404).json({ message: "File not found" });

    const property = await storage.getPropertyById(doc.propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.sendFile(filePath);
  });

  app.delete("/api/vault/:id/file", requireAuth, async (req, res) => {
    const doc = await storage.getVaultDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const property = await storage.getPropertyById(doc.propertyId);
    if (!property || property.userId !== req.session.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (doc.fileUrl) {
      const filePath = path.join(UPLOADS_DIR, path.basename(doc.fileUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const updated = await storage.updateVaultDocument(doc.id, {
      fileUrl: null,
      fileName: null,
      fileSize: null,
      status: "missing",
      uploadedAt: null,
      updatedAt: new Date().toISOString(),
    });
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

  app.post("/api/admin/setup", requireAuth, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const hasAdmin = allUsers.some(u => u.isAdmin);
    if (hasAdmin) return res.status(403).json({ message: "Admin already exists" });
    const updated = await storage.updateUserAdmin(req.session.userId!, true);
    if (updated) await storage.updateUserPro(req.session.userId!, true);
    res.json({ message: "Admin + Pro granted" });
  });

  app.post("/api/admin/bootstrap", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });
    const allUsers = await storage.getAllUsers();
    const hasAdmin = allUsers.some(u => u.isAdmin);
    if (hasAdmin) return res.status(403).json({ message: "Admin already exists. Bootstrap disabled." });
    let user = await storage.getUserByEmail(email);
    if (!user) {
      const hashed = await bcrypt.hash(password, 10);
      user = await storage.createUser({ email, password: hashed, username: null, firstName: "Admin" });
    } else {
      const hashed = await bcrypt.hash(password, 10);
      await storage.updateUserPassword(user.id, hashed);
    }
    await storage.updateUserAdmin(user.id, true);
    await storage.updateUserPro(user.id, true);
    res.json({ message: "Admin account ready. Log in now.", email });
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

  // === Admin platform health (Render API proxy) ===
  app.get("/api/admin/platform-health", requireAuth, requireAdmin, async (req, res) => {
    const RENDER_API_KEY = process.env.RENDER_API_KEY;
    const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;

    if (!RENDER_API_KEY || !RENDER_SERVICE_ID) {
      return res.json({
        status: "healthy",
        uptime: "unknown \u2014 add RENDER_API_KEY and RENDER_SERVICE_ID env vars",
        error: "Render API credentials not configured",
      });
    }

    try {
      const serviceRes = await fetch(`https://api.render.com/v1/services/${RENDER_SERVICE_ID}`, {
        headers: { Authorization: `Bearer ${RENDER_API_KEY}`, Accept: "application/json" },
      });
      const service = await serviceRes.json();

      const deploysRes = await fetch(`https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys?limit=1`, {
        headers: { Authorization: `Bearer ${RENDER_API_KEY}`, Accept: "application/json" },
      });
      const deploys = await deploysRes.json();
      const latestDeploy = deploys?.[0]?.deploy;

      const suspended = service?.suspended === "suspended";
      const status = suspended ? "degraded" : "healthy";

      let uptime = "unknown";
      if (latestDeploy?.finishedAt) {
        const diffMs = Date.now() - new Date(latestDeploy.finishedAt).getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffHours / 24);
        uptime = diffDays > 0 ? `${diffDays}d ${diffHours % 24}h` : `${diffHours}h`;
      }

      res.json({
        status,
        uptime,
        deploy: latestDeploy ? {
          status: latestDeploy.status,
          createdAt: latestDeploy.createdAt,
          finishedAt: latestDeploy.finishedAt,
        } : null,
      });
    } catch (err) {
      res.json({ status: "error", error: "Failed to reach Render API" });
    }
  });

  // === Admin access log ===
  app.get("/api/admin/access-log", requireAuth, requireAdmin, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const entries = await storage.getAccessLog(limit, offset);
    res.json(entries);
  });

  // === Update Preferences (user opt-in settings) ===
  app.get("/api/profile/update-preferences", requireAuth, async (req, res) => {
    const prefs = await storage.getUpdatePreferences(req.session.userId!);
    res.json(prefs);
  });

  app.patch("/api/profile/update-preferences", requireAuth, async (req, res) => {
    const prefs = await storage.upsertUpdatePreferences(req.session.userId!, req.body);
    res.json(prefs);
  });

  // === User Notifications ===
  app.get("/api/notifications", requireAuth, async (req, res) => {
    const notifications = await storage.getUserNotifications(req.session.userId!);
    res.json(notifications);
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    const count = await storage.getUnreadNotificationCount(req.session.userId!);
    res.json({ count });
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    await storage.markNotificationRead(req.params.id, req.session.userId!);
    res.json({ ok: true });
  });

  app.patch("/api/notifications/:id/dismiss", requireAuth, async (req, res) => {
    await storage.dismissNotification(req.params.id, req.session.userId!);
    res.json({ ok: true });
  });

  app.patch("/api/notifications/:id/accept-change", requireAuth, async (req, res) => {
    const notif = await storage.getNotificationById(req.params.id);
    if (!notif || notif.userId !== req.session.userId!) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (notif.pendingChangeType === "filing_shift" && notif.pendingChangeData) {
      const { filingIds, shiftDays } = notif.pendingChangeData as { filingIds: string[]; shiftDays: number };
      for (const filingId of filingIds) {
        const filing = await storage.getRecurringFilingById(filingId);
        if (filing && filing.propertyId) {
          const props = await storage.getPropertiesByUserId(req.session.userId!);
          if (props.some(p => p.id === filing.propertyId)) {
            const current = new Date(filing.dueDate);
            current.setDate(current.getDate() + shiftDays);
            await storage.updateRecurringFiling(filingId, { dueDate: current.toISOString().split("T")[0] });
          }
        }
      }
    }
    await storage.markNotificationRead(req.params.id, req.session.userId!);
    res.json({ ok: true });
  });

  // === Regulatory Changes (admin) ===
  app.get("/api/admin/regulatory-changes", requireAuth, requireAdmin, async (req, res) => {
    const changes = await storage.getRegulatoryChanges();
    res.json(changes);
  });

  app.post("/api/admin/regulatory-changes", requireAuth, requireAdmin, async (req, res) => {
    const change = await storage.createRegulatoryChange({
      ...req.body,
      adminId: req.session.userId!,
    });
    res.json(change);
  });

  // === Apply regulatory change — the cascade engine ===
  app.post("/api/admin/regulatory-changes/:id/apply", requireAuth, requireAdmin, async (req, res) => {
    const {
      actions,
      userMessage,
      regions,
    } = req.body as {
      actions: Array<{
        type: "filing_shift" | "vault_template" | "compliance_term" | "user_alert" | "process_guide";
        filingTypes?: string[];
        shiftDays?: number;
        newDueNote?: string;
        templateSlug?: string;
        templateName?: string;
        templateGate?: number;
        isRequired?: boolean;
        termSlug?: string;
        termUpdates?: Record<string, unknown>;
        guideId?: string;
        guideUpdates?: Record<string, unknown>;
      }>;
      userMessage: string;
      regions: string[];
    };

    const allUsers = await storage.getAllUsers();
    const proUsers = allUsers.filter(u => u.isPro || u.isAdmin);
    const actionsApplied: Array<{ type: string; description: string; affectedCount: number; appliedAt: string }> = [];
    const now = new Date().toISOString();

    for (const action of actions) {
      if (action.type === "filing_shift" && action.filingTypes && action.shiftDays !== undefined) {
        let affectedCount = 0;

        for (const proUser of proUsers) {
          const userProps = await storage.getPropertiesByUserId(proUser.id);
          const targetProps = regions.includes("all")
            ? userProps
            : userProps.filter(p => p.regency && regions.includes(p.regency));

          if (targetProps.length === 0) continue;

          const prefs = await storage.getUpdatePreferences(proUser.id);
          const autoApply = prefs?.autoApplyCalendar ?? false;

          const affectedFilingIds: string[] = [];
          for (const prop of targetProps) {
            const filings = await storage.getRecurringFilings(prop.id);
            const matching = filings.filter(f =>
              action.filingTypes!.some(ft => f.filingType.toLowerCase().includes(ft.toLowerCase()))
              && f.status === "pending"
            );
            for (const filing of matching) {
              if (autoApply) {
                const current = new Date(filing.dueDate);
                current.setDate(current.getDate() + action.shiftDays!);
                await storage.updateRecurringFiling(filing.id, {
                  dueDate: current.toISOString().split("T")[0],
                  notes: `${filing.notes ? filing.notes + " | " : ""}Auto-adjusted: ${action.newDueNote || "regulatory change"}`,
                });
              } else {
                affectedFilingIds.push(filing.id);
              }
            }
          }

          if (affectedFilingIds.length > 0 || autoApply) {
            const shiftLabel = action.shiftDays! < 0
              ? `${Math.abs(action.shiftDays!)} days earlier`
              : `${action.shiftDays!} days later`;

            await storage.createUserNotification({
              userId: proUser.id,
              type: "filing_shifted",
              title: autoApply
                ? `Filing dates auto-adjusted: ${action.filingTypes!.join(", ")}`
                : `Action required: Filing date change for ${action.filingTypes!.join(", ")}`,
              body: autoApply
                ? `Your ${action.filingTypes!.join(" and ")} deadlines have been shifted ${shiftLabel}. ${userMessage}`
                : `Due to a regulatory change, your ${action.filingTypes!.join(" and ")} deadlines need to shift ${shiftLabel}. Review and accept below. ${userMessage}`,
              gate: req.body.gate,
              regency: regions.includes("all") ? null : regions.join(", "),
              requiresAction: !autoApply,
              actionLabel: autoApply ? null : "Review & Accept",
              pendingChangeType: autoApply ? null : "filing_shift",
              pendingChangeData: autoApply ? null : { filingIds: affectedFilingIds, shiftDays: action.shiftDays },
              changeId: req.params.id,
              isRead: false,
              isDismissed: false,
            });
            affectedCount++;
          }
        }

        actionsApplied.push({
          type: "filing_shift",
          description: `Shifted ${action.filingTypes!.join(", ")} by ${action.shiftDays} days`,
          affectedCount,
          appliedAt: now,
        });
      }

      if (action.type === "vault_template" && action.templateSlug && action.templateName) {
        const existing = await storage.getVaultTemplateBySlug(action.templateSlug);
        if (!existing) {
          await storage.createVaultDocumentTemplate({
            gateNumber: action.templateGate || 2,
            documentSlug: action.templateSlug,
            isRequired: action.isRequired ?? true,
            translations: {
              en: { name: action.templateName, description: `Required by regulatory update` },
              id: { name: action.templateName, description: `Diperlukan oleh pembaruan regulasi` },
            },
            isActive: true,
          });
        }
        const targetUsers = proUsers.filter(u => {
          return true;
        });
        for (const u of targetUsers) {
          await storage.createUserNotification({
            userId: u.id,
            type: "vault_updated",
            title: `New document required: ${action.templateName}`,
            body: `A new document has been added to your vault checklist for Gate ${action.templateGate}. ${userMessage}`,
            gate: action.templateGate,
            regency: regions.includes("all") ? null : regions.join(", "),
            requiresAction: true,
            actionLabel: "Upload Document",
            actionUrl: "/vault",
            changeId: req.params.id,
            isRead: false,
            isDismissed: false,
          });
        }
        actionsApplied.push({
          type: "vault_template",
          description: `Added vault template: ${action.templateName}`,
          affectedCount: targetUsers.length,
          appliedAt: now,
        });
      }

      if (action.type === "user_alert") {
        let affectedCount = 0;
        for (const proUser of proUsers) {
          if (!regions.includes("all")) {
            const userProps = await storage.getPropertiesByUserId(proUser.id);
            const inRegion = userProps.some(p => p.regency && regions.includes(p.regency));
            if (!inRegion) continue;
          }
          await storage.createUserNotification({
            userId: proUser.id,
            type: "regulatory_change",
            title: req.body.title || "Regulatory update",
            body: userMessage,
            gate: req.body.gate,
            regency: regions.includes("all") ? null : regions.join(", "),
            requiresAction: false,
            changeId: req.params.id,
            isRead: false,
            isDismissed: false,
          });
          affectedCount++;
        }
        actionsApplied.push({
          type: "user_alert",
          description: `Sent notification to ${affectedCount} Pro users`,
          affectedCount,
          appliedAt: now,
        });
      }
    }

    await storage.updateRegulatoryChange(req.params.id, {
      status: "applied",
      actionsApplied,
      userMessage,
      appliedAt: now,
    });

    await storage.createAccessLogEntry(
      req.session.userId!,
      req.session.userId!,
      "apply_regulatory_change",
      { changeId: req.params.id, actionsCount: String(actions.length) }
    );

    res.json({ ok: true, actionsApplied });
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

  // === Calendar Event Templates ===
  app.get("/api/calendar-templates", requireAuth, async (req, res) => {
    const activeOnly = req.query.activeOnly === "true";
    const templates = await storage.getAllCalendarEventTemplates(activeOnly);
    res.json(templates);
  });

  app.patch("/api/calendar-templates/:id", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user?.isAdmin && !user?.isPro) return res.status(403).json({ message: "Pro or Admin access required" });
    const partialSchema = insertCalendarEventTemplateSchema.partial();
    const parsed = partialSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const updated = await storage.updateCalendarEventTemplate(req.params.id, parsed.data);
    if (!updated) return res.status(404).json({ message: "Template not found" });
    res.json(updated);
  });

  app.post("/api/calendar-templates", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user?.isAdmin && !user?.isPro) return res.status(403).json({ message: "Pro or Admin access required" });
    const parsed = insertCalendarEventTemplateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const template = await storage.createCalendarEventTemplate(parsed.data);
    res.status(201).json(template);
  });

  app.delete("/api/calendar-templates/:id", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user?.isAdmin && !user?.isPro) return res.status(403).json({ message: "Pro or Admin access required" });
    await storage.deleteCalendarEventTemplate(req.params.id);
    res.json({ ok: true });
  });

  return httpServer;
}
