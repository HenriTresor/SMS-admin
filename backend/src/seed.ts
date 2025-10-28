import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    // Default admin credentials
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Hash the password using SHA-512
    const hashedPassword = crypto.createHash('sha512').update(adminPassword).digest('hex');

    // Create or update admin user
    const admin = await prisma.admin.upsert({
      where: { username: adminUsername },
      update: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
      create: {
        username: adminUsername,
        password: hashedPassword,
      },
    });

    console.log('✅ Admin user seeded successfully!');
    console.log(`Username: ${admin.username}`);
    console.log(`Password: ${adminPassword}`);
    console.log('⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAdmin();
