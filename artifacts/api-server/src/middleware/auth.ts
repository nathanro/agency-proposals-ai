import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-prod";

export interface AuthRequest extends Request {
  userId?: string;
  organizationId?: string;
  role?: string;
  isSuperAdmin?: boolean;
}

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: string;
  isSuperAdmin: boolean;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = payload.userId;
    req.organizationId = payload.organizationId;
    req.role = payload.role;
    req.isSuperAdmin = payload.isSuperAdmin ?? false;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isSuperAdmin) {
    res.status(403).json({ error: "Superadmin access required" });
    return;
  }
  next();
}

export function signToken(userId: string, organizationId: string, role: string, isSuperAdmin: boolean): string {
  return jwt.sign({ userId, organizationId, role, isSuperAdmin }, JWT_SECRET, { expiresIn: "7d" });
}
