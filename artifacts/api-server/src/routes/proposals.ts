import { Router } from "express";
import { db } from "@workspace/db";
import { proposalsTable, serviceTemplatesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/proposals
router.get("/proposals", async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select({
        id: proposalsTable.id,
        clientName: proposalsTable.clientName,
        clientEmail: proposalsTable.clientEmail,
        clientCompany: proposalsTable.clientCompany,
        status: proposalsTable.status,
        finalPrice: proposalsTable.finalPrice,
        currency: proposalsTable.currency,
        discountPercentage: proposalsTable.discountPercentage,
        customMessage: proposalsTable.customMessage,
        expiresAt: proposalsTable.expiresAt,
        createdAt: proposalsTable.createdAt,
        serviceTemplateId: proposalsTable.serviceTemplateId,
        templateName: serviceTemplatesTable.name,
      })
      .from(proposalsTable)
      .leftJoin(serviceTemplatesTable, eq(proposalsTable.serviceTemplateId, serviceTemplatesTable.id))
      .where(eq(proposalsTable.userId, req.userId!))
      .orderBy(desc(proposalsTable.createdAt));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/proposals
router.post("/proposals", async (req: AuthRequest, res) => {
  const { serviceTemplateId, clientName, clientEmail, clientCompany, customMessage, discountPercentage } = req.body;
  if (!serviceTemplateId || !clientName || !clientEmail) {
    res.status(400).json({ error: "serviceTemplateId, clientName and clientEmail are required" });
    return;
  }
  try {
    const [template] = await db
      .select()
      .from(serviceTemplatesTable)
      .where(and(eq(serviceTemplatesTable.id, serviceTemplateId), eq(serviceTemplatesTable.userId, req.userId!)))
      .limit(1);
    if (!template) { res.status(404).json({ error: "Template not found" }); return; }

    const discount = Number(discountPercentage) || 0;
    const finalPrice = (Number(template.price) * (1 - discount / 100)).toFixed(2);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [proposal] = await db.insert(proposalsTable).values({
      userId: req.userId!,
      serviceTemplateId,
      clientName,
      clientEmail,
      clientCompany: clientCompany || null,
      status: "draft",
      customMessage: customMessage || null,
      discountPercentage: discount,
      finalPrice,
      currency: template.currency,
      expiresAt,
    }).returning();
    res.status(201).json(proposal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/proposals/:id
router.patch("/proposals/:id", async (req: AuthRequest, res) => {
  const { status } = req.body;
  try {
    const [updated] = await db
      .update(proposalsTable)
      .set({ status })
      .where(and(eq(proposalsTable.id, req.params.id), eq(proposalsTable.userId, req.userId!)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Proposal not found" }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/proposals/:id
router.delete("/proposals/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(proposalsTable)
      .where(and(eq(proposalsTable.id, req.params.id), eq(proposalsTable.userId, req.userId!)));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
