import { Response } from 'express';
import { AdminAuthRequest } from '../middlewares/adminAuth';
import { AdminManagementService } from '../services/adminManagementService';

export class AdminManagementController {
  static async getUsers(req: AdminAuthRequest, res: Response) {
    try {
      const users = await AdminManagementService.getUsers();
      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDevices(req: AdminAuthRequest, res: Response) {
    try {
      const devices = await AdminManagementService.getDevices();
      res.json({ devices });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async verifyDevice(req: AdminAuthRequest, res: Response) {
    try {
      const { deviceId } = req.params;
      const device = await AdminManagementService.verifyDevice(deviceId);
      res.json({ device });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getTransactions(req: AdminAuthRequest, res: Response) {
    try {
      const transactions = await AdminManagementService.getTransactions();
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
