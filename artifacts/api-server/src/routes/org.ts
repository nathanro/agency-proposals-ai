import { Router } from "express";
import { db } from "@workspace/db";
import { organizationsTable, proposalsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/org — current user's organization branding
router.get("/org", async (req: AuthRequest, res) => {
  try {
    if (!req.organizationId) {
      res.status(404).json({ error: "No organization found" });
      return;
    }
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, req.organizationId))
      .limit(1);
    if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
    res.json(org);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/org — update org branding (owner only)
router.put("/org", async (req: AuthRequest, res) => {
  if (req.role !== "owner") {
    res.status(403).json({ error: "Only owners can update organization settings" });
    return;
  }
  const { name, logoUrl, primaryColor } = req.body;
  try {
    const updates: Record<string, unknown> = {};
    if (name !== undefined && name.trim()) updates.name = name.trim();
    if (logoUrl !== undefined) updates.logoUrl = logoUrl || null;
    if (primaryColor !== undefined) updates.primaryColor = primaryColor;

    const [updated] = await db
      .update(organizationsTable)
      .set(updates)
      .where(eq(organizationsTable.id, req.organizationId!))
      .returning();
    if (!updated) { res.status(404).json({ error: "Organization not found" }); return; }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/org/usage — proposal count for current org
router.get("/org/usage", async (req: AuthRequest, res) => {
  try {
    const [result] = await db
      .select({ total: count() })
      .from(proposalsTable)
      .where(eq(proposalsTable.organizationId, req.organizationId!));
    res.json({ proposals: Number(result?.total ?? 0) });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
