import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AdminAuthRequest extends Request {
  adminId?: string;
}

export const authenticateAdmin = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Access denied' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};
