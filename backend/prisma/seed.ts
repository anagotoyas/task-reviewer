import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const roleNames = ['admin', 'teacher', 'student'];
  const roles: Record<string, string> = {};

  for (const name of roleNames) {
    let role = await prisma.role.findFirst({ where: { name } });
    if (!role) {
      role = await prisma.role.create({ data: { name } });
    }
    roles[name] = role.id;
  }

  // Seed admin user from env
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@myspace.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Super';
  const adminLastname = process.env.ADMIN_LASTNAME || 'Admin';

  if (!adminPassword) throw new Error('ADMIN_PASSWORD env variable is required');
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      lastname: adminLastname,
      email: adminEmail,
      password: hashedPassword,
      roleId: roles['admin'],
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
