import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminManagementService {
  static async getUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        balance: true,
        createdAt: true,
        devices: {
          select: {
            id: true,
            deviceId: true,
            isVerified: true,
          },
        },
      },
    });
  }

  static async getDevices() {
    return await prisma.device.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  static async verifyDevice(deviceId: string) {
    const device = await prisma.device.update({
      where: { id: deviceId },
      data: { isVerified: true },
    });
    return device;
  }

  static async getTransactions() {
    return await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
