import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertComplianceTermSchema } from "@shared/schema";
import { seedComplianceTerms } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedComplianceTerms();

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

  return httpServer;
}
