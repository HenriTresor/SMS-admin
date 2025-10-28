import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../app';
import { AdminManagementService } from '../services/adminManagementService';

const TEST_SECRET = 'test-admin-secret';
const getToken = () => jwt.sign({ adminId: 'admin-1' }, TEST_SECRET);

describe('Admin management routes', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /admin/users', () => {
    it('returns list of users', async () => {
      const users = [{ id: '1', email: 'user@example.com' }];
      const spy = jest.spyOn(AdminManagementService, 'getUsers').mockResolvedValue(users as any);

      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res.body).toEqual({ users });
    });

    it('propagates service errors', async () => {
      jest.spyOn(AdminManagementService, 'getUsers').mockRejectedValue(new Error('boom'));

      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(500);

      expect(res.body).toEqual({ error: 'boom' });
    });
  });

  describe('GET /admin/devices', () => {
    it('returns device list', async () => {
      const devices = [{ id: 'device-1', deviceId: 'ABC', user: { id: '1', email: 'user@example.com' } }];
      const spy = jest.spyOn(AdminManagementService, 'getDevices').mockResolvedValue(devices as any);

      const res = await request(app)
        .get('/admin/devices')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res.body).toEqual({ devices });
    });

    it('handles errors from service', async () => {
      jest.spyOn(AdminManagementService, 'getDevices').mockRejectedValue(new Error('fail'));

      const res = await request(app)
        .get('/admin/devices')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(500);

      expect(res.body).toEqual({ error: 'fail' });
    });
  });

  describe('PUT /admin/devices/:deviceId/verify', () => {
    it('verifies device when id supplied', async () => {
      const device = { id: 'device-1', deviceId: 'ABC', isVerified: true };
      const spy = jest.spyOn(AdminManagementService, 'verifyDevice').mockResolvedValue(device as any);

      const res = await request(app)
        .put('/admin/devices/device-1/verify')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(spy).toHaveBeenCalledWith('device-1');
      expect(res.body).toEqual({ device });
    });

    it('returns 400 when service throws', async () => {
      jest.spyOn(AdminManagementService, 'verifyDevice').mockRejectedValue(new Error('not found'));

      const res = await request(app)
        .put('/admin/devices/device-1/verify')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(400);

      expect(res.body).toEqual({ error: 'not found' });
    });
  });

  describe('GET /admin/transactions', () => {
    it('returns transactions', async () => {
      const transactions = [{ id: 'txn-1', amount: 100 }];
      const spy = jest.spyOn(AdminManagementService, 'getTransactions').mockResolvedValue(transactions as any);

      const res = await request(app)
        .get('/admin/transactions')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(res.body).toEqual({ transactions });
    });

    it('handles service errors', async () => {
      jest.spyOn(AdminManagementService, 'getTransactions').mockRejectedValue(new Error('oops'));

      const res = await request(app)
        .get('/admin/transactions')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(500);

      expect(res.body).toEqual({ error: 'oops' });
    });
  });
});
