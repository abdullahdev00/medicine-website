import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AdminRequest extends Request {
  adminId?: string;
  isAdmin?: boolean;
}

export async function requireAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.session?.adminId;
    
    if (!adminId) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    const admin = await storage.getAdminById(adminId);
    if (!admin || !admin.isActive) {
      req.session.adminId = undefined;
      return res.status(401).json({ message: "Invalid or inactive admin account" });
    }

    req.adminId = adminId;
    req.isAdmin = true;
    next();
  } catch (error) {
    res.status(500).json({ message: "Authentication error" });
  }
}
