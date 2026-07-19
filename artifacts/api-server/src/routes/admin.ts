import { Router } from "express";
import { db } from "@workspace/db";
import { organizationsTable, proposalsTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth, requireSuperAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Both middlewares applied: auth first, then superadmin check via JWT flag
router.use(requireAuth);
router.use(requireSuperAdmin);

// GET /api/admin/orgs — list all orgs with usage metrics
router.get("/admin/orgs", async (_req: AuthRequest, res) => {
  try {
    const orgs = await db
      .select({
        id: organizationsTable.id,
        name: organizationsTable.name,
        logoUrl: organizationsTable.logoUrl,
        primaryColor: organizationsTable.primaryColor,
        plan: organizationsTable.plan,
        giftedAccess: organizationsTable.giftedAccess,
        proposalLimit: organizationsTable.proposalLimit,
        memberLimit: organizationsTable.memberLimit,
        ownerEmail: organizationsTable.ownerEmail,
        createdAt: organizationsTable.createdAt,
      })
      .from(organizationsTable)
      .orderBy(desc(organizationsTable.createdAt));

    // Proposal counts per org in a single query
    const counts = await db
      .select({ organizationId: proposalsTable.organizationId, total: count() })
      .from(proposalsTable)
      .groupBy(proposalsTable.organizationId);

    const countMap = new Map(counts.map((c) => [c.organizationId, Number(c.total)]));

    res.json(orgs.map((org) => ({ ...org, proposalCount: countMap.get(org.id) ?? 0 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/orgs/:id — change plan, gifted, or limits
router.put("/admin/orgs/:id", async (req: AuthRequest, res) => {
  const { plan, giftedAccess, proposalLimit, memberLimit, name } = req.body;
  try {
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (giftedAccess !== undefined) updates.giftedAccess = giftedAccess;
    if (proposalLimit !== undefined) updates.proposalLimit = Number(proposalLimit);
    if (memberLimit !== undefined) updates.memberLimit = Number(memberLimit);

    if (plan !== undefined) {
      updates.plan = plan;
      const LIMITS: Record<string, { proposals: number; members: number }> = {
        free:    { proposals: 10,  members: 1  },
        starter: { proposals: 50,  members: 3  },
        pro:     { proposals: 200, members: 10 },
        agency:  { proposals: 500, members: 25 },
      };
      if (LIMITS[plan]) {
        if (proposalLimit === undefined) updates.proposalLimit = LIMITS[plan].proposals;
        if (memberLimit === undefined) updates.memberLimit = LIMITS[plan].members;
      }
    }

    const [updated] = await db
      .update(organizationsTable)
      .set(updates)
      .where(eq(organizationsTable.id, req.params.id as string))
      .returning();
    if (!updated) { res.status(404).json({ error: "Organization not found" }); return; }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
