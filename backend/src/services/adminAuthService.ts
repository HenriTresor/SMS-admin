import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class AdminAuthService {
  static hashPassword(password: string): string {
    return crypto.createHash('sha512').update(password).digest('hex');
  }

  static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  static generateToken(adminId: string): string {
    return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '1h' });
  }

  static async login(username: string, password: string) {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });
    if (!admin) throw new Error('Admin not found');

    if (!this.verifyPassword(password, admin.password)) {
      throw new Error('Invalid password');
    }

    const token = this.generateToken(admin.id);
    return { token, admin: { id: admin.id, username: admin.username } };
  }
}
