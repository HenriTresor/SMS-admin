import { Request, Response } from 'express';
import { AdminAuthService } from '../services/adminAuthService';

export class AdminAuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const { token, admin } = await AdminAuthService.login(username, password);
      res.json({ token, admin });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
