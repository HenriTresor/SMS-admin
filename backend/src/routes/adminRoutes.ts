import { Router } from 'express';
import { AdminAuthController } from '../controllers/adminAuthController';
import { AdminManagementController } from '../controllers/adminManagementController';
import { authenticateAdmin } from '../middlewares/adminAuth';
import { validate } from '../middlewares/validation';
import { adminLoginSchema, deviceVerificationParamsSchema } from '../schemas/adminSchemas';

const router = Router();

router.post('/login', validate(adminLoginSchema), AdminAuthController.login);

// Protected routes
router.get('/users', authenticateAdmin, AdminManagementController.getUsers);
router.get('/devices', authenticateAdmin, AdminManagementController.getDevices);
router.put('/devices/:deviceId/verify', authenticateAdmin, validate(deviceVerificationParamsSchema, 'params'), AdminManagementController.verifyDevice);
router.get('/transactions', authenticateAdmin, AdminManagementController.getTransactions);

export default router;
