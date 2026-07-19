import { Router } from "express";
import { db } from "@workspace/db";
import { proposalsTable, serviceTemplatesTable, usersTable, organizationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { randomBytes } from "crypto";

const router = Router();

// ── PUBLIC routes (no auth) ────────────────────────────────────────────────────

// GET /api/proposals/public/:token
router.get("/proposals/public/:token", async (req, res) => {
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
        aiContent: proposalsTable.aiContent,
        proposalType: proposalsTable.proposalType,
        expiresAt: proposalsTable.expiresAt,
        createdAt: proposalsTable.createdAt,
        serviceTemplateId: proposalsTable.serviceTemplateId,
        templateName: serviceTemplatesTable.name,
        templateDescription: serviceTemplatesTable.description,
        templateDurationDays: serviceTemplatesTable.durationDays,
        templateDeliverables: serviceTemplatesTable.deliverables,
        templateCategory: serviceTemplatesTable.category,
        // Org branding (white-label)
        agencyName: organizationsTable.name,
        agencyLogo: organizationsTable.logoUrl,
        agencyColor: organizationsTable.primaryColor,
        // Fallback from user
        agentName: usersTable.name,
      })
      .from(proposalsTable)
      .leftJoin(serviceTemplatesTable, eq(proposalsTable.serviceTemplateId, serviceTemplatesTable.id))
      .leftJoin(usersTable, eq(proposalsTable.userId, usersTable.id))
      .leftJoin(organizationsTable, eq(proposalsTable.organizationId, organizationsTable.id))
      .where(eq(proposalsTable.publicToken, req.params.token as string))
      .limit(1);

    if (!rows[0]) {
      res.status(404).json({ error: "Propuesta no encontrada" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/proposals/public/:token/respond — client accepts or rejects
router.post("/proposals/public/:token/respond", async (req, res) => {
  const { action } = req.body;
  if (!action || !["accept", "reject"].includes(action)) {
    res.status(400).json({ error: "action must be 'accept' or 'reject'" });
    return;
  }
  try {
    const [proposal] = await db
      .select({ status: proposalsTable.status, expiresAt: proposalsTable.expiresAt })
      .from(proposalsTable)
      .where(eq(proposalsTable.publicToken, req.params.token as string))
      .limit(1);

    if (!proposal) { res.status(404).json({ error: "Propuesta no encontrada" }); return; }
    if (proposal.status === "accepted" || proposal.status === "rejected") {
      res.status(409).json({ error: "Esta propuesta ya fue respondida", status: proposal.status });
      return;
    }
    if (proposal.expiresAt && new Date(proposal.expiresAt) < new Date()) {
      res.status(410).json({ error: "Esta propuesta ha vencido" });
      return;
    }
    if (proposal.status !== "sent") {
      res.status(400).json({ error: "La propuesta no está disponible para respuesta" });
      return;
    }

    const status = action === "accept" ? "accepted" : "rejected";
    const [updated] = await db
      .update(proposalsTable)
      .set({ status })
      .where(eq(proposalsTable.publicToken, req.params.token as string))
      .returning();
    res.json({ ok: true, status: updated.status });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PROTECTED routes ───────────────────────────────────────────────────────────
router.use(requireAuth);

// GET /api/proposals — org-scoped list
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
        aiContent: proposalsTable.aiContent,
        proposalType: proposalsTable.proposalType,
        publicToken: proposalsTable.publicToken,
        expiresAt: proposalsTable.expiresAt,
        createdAt: proposalsTable.createdAt,
        serviceTemplateId: proposalsTable.serviceTemplateId,
        templateName: serviceTemplatesTable.name,
        templateCategory: serviceTemplatesTable.category,
      })
      .from(proposalsTable)
      .leftJoin(serviceTemplatesTable, eq(proposalsTable.serviceTemplateId, serviceTemplatesTable.id))
      .where(eq(proposalsTable.organizationId, req.organizationId!))
      .orderBy(desc(proposalsTable.createdAt));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/proposals/:id — org-scoped single
router.get("/proposals/:id", async (req: AuthRequest, res) => {
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
        aiContent: proposalsTable.aiContent,
        proposalType: proposalsTable.proposalType,
        publicToken: proposalsTable.publicToken,
        expiresAt: proposalsTable.expiresAt,
        createdAt: proposalsTable.createdAt,
        serviceTemplateId: proposalsTable.serviceTemplateId,
        templateName: serviceTemplatesTable.name,
        templateDescription: serviceTemplatesTable.description,
        templatePrice: serviceTemplatesTable.price,
        templateDurationDays: serviceTemplatesTable.durationDays,
        templateDeliverables: serviceTemplatesTable.deliverables,
        templateCurrency: serviceTemplatesTable.currency,
        templateCategory: serviceTemplatesTable.category,
      })
      .from(proposalsTable)
      .leftJoin(serviceTemplatesTable, eq(proposalsTable.serviceTemplateId, serviceTemplatesTable.id))
      .where(and(eq(proposalsTable.id, req.params.id as string), eq(proposalsTable.organizationId, req.organizationId!)))
      .limit(1);

    if (!rows[0]) { res.status(404).json({ error: "Proposal not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/proposals
router.post("/proposals", async (req: AuthRequest, res) => {
  const { serviceTemplateId, clientName, clientEmail, clientCompany, customMessage, discountPercentage, aiContent, proposalType } = req.body;
  if (!serviceTemplateId || !clientName || !clientEmail) {
    res.status(400).json({ error: "serviceTemplateId, clientName and clientEmail are required" });
    return;
  }
  try {
    // Template must belong to same org
    const [template] = await db
      .select()
      .from(serviceTemplatesTable)
      .where(and(eq(serviceTemplatesTable.id, serviceTemplateId), eq(serviceTemplatesTable.organizationId, req.organizationId!)))
      .limit(1);
    if (!template) { res.status(404).json({ error: "Template not found" }); return; }

    const discount = Number(discountPercentage) || 0;
    const finalPrice = (Number(template.price) * (1 - discount / 100)).toFixed(2);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [proposal] = await db.insert(proposalsTable).values({
      userId: req.userId!,
      organizationId: req.organizationId!,
      serviceTemplateId,
      proposalType: proposalType || template.category || "project",
      clientName,
      clientEmail,
      clientCompany: clientCompany || null,
      status: "draft",
      customMessage: customMessage || null,
      discountPercentage: discount,
      finalPrice,
      currency: template.currency,
      aiContent: aiContent || null,
      expiresAt,
    }).returning();
    res.status(201).json(proposal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/proposals/:id — full update (org-scoped)
router.put("/proposals/:id", async (req: AuthRequest, res) => {
  const { clientName, clientEmail, clientCompany, customMessage, discountPercentage, aiContent, proposalType, serviceTemplateId } = req.body;
  try {
    const [current] = await db
      .select({ serviceTemplateId: proposalsTable.serviceTemplateId, discountPercentage: proposalsTable.discountPercentage })
      .from(proposalsTable)
      .where(and(eq(proposalsTable.id, req.params.id as string), eq(proposalsTable.organizationId, req.organizationId!)))
      .limit(1);
    if (!current) { res.status(404).json({ error: "Proposal not found" }); return; }

    let finalPrice: string | undefined;
    if (serviceTemplateId || discountPercentage !== undefined) {
      const tid = serviceTemplateId || current.serviceTemplateId;
      const [template] = await db
        .select()
        .from(serviceTemplatesTable)
        .where(and(eq(serviceTemplatesTable.id, tid), eq(serviceTemplatesTable.organizationId, req.organizationId!)))
        .limit(1);
      if (!template) { res.status(403).json({ error: "Template not found or access denied" }); return; }
      const disc = discountPercentage !== undefined ? Number(discountPercentage) : current.discountPercentage;
      finalPrice = (Number(template.price) * (1 - disc / 100)).toFixed(2);
    }

    const updateData: Record<string, unknown> = {};
    if (clientName !== undefined) updateData.clientName = clientName;
    if (clientEmail !== undefined) updateData.clientEmail = clientEmail;
    if (clientCompany !== undefined) updateData.clientCompany = clientCompany || null;
    if (customMessage !== undefined) updateData.customMessage = customMessage || null;
    if (discountPercentage !== undefined) updateData.discountPercentage = Number(discountPercentage);
    if (aiContent !== undefined) updateData.aiContent = aiContent;
    if (proposalType !== undefined) updateData.proposalType = proposalType;
    if (serviceTemplateId !== undefined) updateData.serviceTemplateId = serviceTemplateId;
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;

    const [updated] = await db
      .update(proposalsTable)
      .set(updateData)
      .where(and(eq(proposalsTable.id, req.params.id as string), eq(proposalsTable.organizationId, req.organizationId!)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Proposal not found" }); return; }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/proposals/:id — status only
router.patch("/proposals/:id", async (req: AuthRequest, res) => {
  const { status } = req.body;
  try {
    const [updated] = await db
      .update(proposalsTable)
      .set({ status })
      .where(and(eq(proposalsTable.id, req.params.id as string), eq(proposalsTable.organizationId, req.organizationId!)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Proposal not found" }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/proposals/:id/send
router.post("/proposals/:id/send", async (req: AuthRequest, res) => {
  try {
    const token = randomBytes(24).toString("hex");
    const [updated] = await db
      .update(proposalsTable)
      .set({ status: "sent", publicToken: token })
      .where(and(eq(proposalsTable.id, req.params.id as string), eq(proposalsTable.organizationId, req.organizationId!)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Proposal not found" }); return; }
    res.json({ ok: true, publicToken: token, proposal: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/proposals/:id
router.delete("/proposals/:id", async (req: AuthRequest, res) => {
  try {
    await db
      .delete(proposalsTable)
      .where(and(eq(proposalsTable.id, req.params.id as string), eq(proposalsTable.organizationId, req.organizationId!)));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
