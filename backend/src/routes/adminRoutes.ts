import { Router } from 'express';
import { AdminAuthController } from '../controllers/adminAuthController';
import { AdminManagementController } from '../controllers/adminManagementController';
import { authenticateAdmin } from '../middlewares/adminAuth';
import { validate } from '../middlewares/validation';
import Joi from 'joi';

const router = Router();

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

router.post('/login', validate(loginSchema), AdminAuthController.login);

// Protected routes
router.get('/users', authenticateAdmin, AdminManagementController.getUsers);
router.get('/devices', authenticateAdmin, AdminManagementController.getDevices);
router.put('/devices/:deviceId/verify', authenticateAdmin, AdminManagementController.verifyDevice);
router.get('/transactions', authenticateAdmin, AdminManagementController.getTransactions);

export default router;
