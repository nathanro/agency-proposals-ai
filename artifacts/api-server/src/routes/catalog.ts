import { Router } from "express";
import { db } from "@workspace/db";
import { catalogServicesTable, serviceTemplatesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireSuperAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// ── Agency routes (any authenticated user) ────────────────────────────────────

// GET /api/catalog — list active catalog services
router.get("/catalog", requireAuth, async (_req: AuthRequest, res) => {
  try {
    const services = await db
      .select()
      .from(catalogServicesTable)
      .where(eq(catalogServicesTable.isActive, true))
      .orderBy(desc(catalogServicesTable.createdAt));
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/catalog/:id/import — import a catalog service as an org template
router.post("/catalog/:id/import", requireAuth, async (req: AuthRequest, res) => {
  const { salePrice } = req.body;
  if (salePrice == null || isNaN(Number(salePrice)) || Number(salePrice) < 0) {
    res.status(400).json({ error: "salePrice is required and must be a valid number" });
    return;
  }
  try {
    const [service] = await db
      .select()
      .from(catalogServicesTable)
      .where(
        and(
          eq(catalogServicesTable.id, req.params.id as string),
          eq(catalogServicesTable.isActive, true),
        ),
      )
      .limit(1);

    if (!service) {
      res.status(404).json({ error: "Catalog service not found or inactive" });
      return;
    }

    // Create org template as a copy — agency owns their price; Publiexpert is invisible to client
    const [tmpl] = await db
      .insert(serviceTemplatesTable)
      .values({
        userId: req.userId!,
        organizationId: req.organizationId!,
        name: service.name,
        description: service.description,
        price: Number(salePrice).toFixed(2),
        currency: service.currency,
        durationDays: service.durationDays,
        deliverables: service.deliverables,
        category: service.category,
        isActive: true,
        sourceServiceId: service.id,
      })
      .returning();

    res.status(201).json(tmpl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Superadmin catalog management (requireAuth + requireSuperAdmin per route) ─

// GET /api/catalog/admin — list ALL catalog services (including inactive)
router.get("/catalog/admin", requireAuth, requireSuperAdmin, async (_req: AuthRequest, res) => {
  try {
    const services = await db
      .select()
      .from(catalogServicesTable)
      .orderBy(desc(catalogServicesTable.createdAt));
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/catalog/admin — create catalog service
router.post("/catalog/admin", requireAuth, requireSuperAdmin, async (req: AuthRequest, res) => {
  const { name, description, category, basePrice, suggestedPrice, currency, durationDays, deliverables } = req.body;
  if (!name || !description || basePrice == null) {
    res.status(400).json({ error: "name, description and basePrice are required" });
    return;
  }
  try {
    const [service] = await db
      .insert(catalogServicesTable)
      .values({
        name,
        description,
        category: category || "project",
        basePrice: Number(basePrice).toFixed(2),
        suggestedPrice: suggestedPrice != null ? Number(suggestedPrice).toFixed(2) : null,
        currency: currency || "USD",
        durationDays: Number(durationDays) || 30,
        deliverables: deliverables || [],
        isActive: true,
      })
      .returning();
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/catalog/admin/:id — full update
router.put("/catalog/admin/:id", requireAuth, requireSuperAdmin, async (req: AuthRequest, res) => {
  const { name, description, category, basePrice, suggestedPrice, currency, durationDays, deliverables } = req.body;
  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (basePrice !== undefined) updates.basePrice = Number(basePrice).toFixed(2);
    if (suggestedPrice !== undefined) updates.suggestedPrice = suggestedPrice != null ? Number(suggestedPrice).toFixed(2) : null;
    if (currency !== undefined) updates.currency = currency;
    if (durationDays !== undefined) updates.durationDays = Number(durationDays);
    if (deliverables !== undefined) updates.deliverables = deliverables;

    const [updated] = await db
      .update(catalogServicesTable)
      .set(updates)
      .where(eq(catalogServicesTable.id, req.params.id as string))
      .returning();
    if (!updated) { res.status(404).json({ error: "Service not found" }); return; }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/catalog/admin/:id — toggle isActive
router.patch("/catalog/admin/:id", requireAuth, requireSuperAdmin, async (req: AuthRequest, res) => {
  const { isActive } = req.body;
  if (isActive === undefined) {
    res.status(400).json({ error: "isActive is required" });
    return;
  }
  try {
    const [updated] = await db
      .update(catalogServicesTable)
      .set({ isActive: Boolean(isActive), updatedAt: new Date() })
      .where(eq(catalogServicesTable.id, req.params.id as string))
      .returning();
    if (!updated) { res.status(404).json({ error: "Service not found" }); return; }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
