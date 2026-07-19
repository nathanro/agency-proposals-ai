import { Router } from "express";
import { db } from "@workspace/db";
import { serviceTemplatesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/templates
router.get("/templates", async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(serviceTemplatesTable)
      .where(eq(serviceTemplatesTable.userId, req.userId!))
      .orderBy(desc(serviceTemplatesTable.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/templates
router.post("/templates", async (req: AuthRequest, res) => {
  const { name, description, price, currency, durationDays, deliverables, category } = req.body;
  if (!name || !description || price == null) {
    res.status(400).json({ error: "name, description and price are required" });
    return;
  }
  try {
    const [tmpl] = await db.insert(serviceTemplatesTable).values({
      userId: req.userId!,
      name,
      description,
      price: String(price),
      currency: currency || "USD",
      durationDays: Number(durationDays) || 30,
      deliverables: deliverables || [],
      category: category || "project",
      isActive: true,
    }).returning();
    res.status(201).json(tmpl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/templates/:id
router.patch("/templates/:id", async (req: AuthRequest, res) => {
  const { name, description, price, currency, durationDays, deliverables, isActive, category } = req.body;
  try {
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = String(price);
    if (currency !== undefined) updates.currency = currency;
    if (durationDays !== undefined) updates.durationDays = Number(durationDays);
    if (deliverables !== undefined) updates.deliverables = deliverables;
    if (isActive !== undefined) updates.isActive = isActive;
    if (category !== undefined) updates.category = category;

    const [updated] = await db
      .update(serviceTemplatesTable)
      .set(updates)
      .where(and(eq(serviceTemplatesTable.id, req.params.id as string), eq(serviceTemplatesTable.userId, req.userId!)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Template not found" }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/templates/:id
router.delete("/templates/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(serviceTemplatesTable)
      .where(and(eq(serviceTemplatesTable.id, req.params.id as string), eq(serviceTemplatesTable.userId, req.userId!)));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
