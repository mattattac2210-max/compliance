import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertComplianceTermSchema, insertProcessGuideSchema, insertPropertySchema } from "@shared/schema";
import { seedComplianceTerms } from "./seed";
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
    res.status(201).json({ id: user.id, email: user.email, isAdmin: user.isAdmin });
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
    res.json({ id: user.id, email: user.email, isAdmin: user.isAdmin });
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
    res.json({ id: user.id, email: user.email, isAdmin: user.isAdmin });
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

  return httpServer;
}
