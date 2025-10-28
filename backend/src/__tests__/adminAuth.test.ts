import request from 'supertest';

import app from '../app';
import { AdminAuthService } from '../services/adminAuthService';
describe('POST /admin/login', () => {
  it('returns token and admin details on successful login', async () => {
    const mockResponse = {
      token: 'mock-token',
      admin: { id: 'admin-id', username: 'admin' },
    };

    const loginSpy = jest.spyOn(AdminAuthService, 'login').mockResolvedValue(mockResponse);

    const res = await request(app)
      .post('/admin/login')
      .send({ username: 'admin', password: 'secret' })
      .expect(200);

    expect(loginSpy).toHaveBeenCalledWith('admin', 'secret');
    expect(res.body).toEqual(mockResponse);

    loginSpy.mockRestore();
  });

  it('responds with 401 when credentials are invalid', async () => {
    const loginSpy = jest.spyOn(AdminAuthService, 'login').mockRejectedValue(new Error('Invalid password'));

    const res = await request(app)
      .post('/admin/login')
      .send({ username: 'admin', password: 'wrong' })
      .expect(401);

    expect(res.body).toEqual({ error: 'Invalid password' });

    loginSpy.mockRestore();
  });

  it('returns 400 when payload is invalid', async () => {
    const res = await request(app)
      .post('/admin/login')
      .send({ username: 'admin' })
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });
});
