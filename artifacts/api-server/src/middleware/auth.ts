import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-prod";

export interface AuthRequest extends Request {
  userId?: string;
  organizationId?: string;
  role?: string;
}

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: string;
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
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function signToken(userId: string, organizationId: string, role: string): string {
  return jwt.sign({ userId, organizationId, role }, JWT_SECRET, { expiresIn: "7d" });
}
