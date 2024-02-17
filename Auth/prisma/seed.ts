import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser(email: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: email,
      password: hashedPassword,
    },
  });
}

async function assignAdminRoleToUser(userId: number) {
  return prisma.admin.create({
    data: {
      userId: userId,
    },
  });
}

async function ensureAdminExists() {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123"; // Utilize a more secure password in production

  // Check if admin user already exists
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    console.log("Creating admin user...");
    adminUser = await createAdminUser(adminEmail, adminPassword);
    console.log("Admin user created.");
  }

  // Check if admin user already has an admin role assigned
  const adminEntry = await prisma.admin.findUnique({
    where: { userId: adminUser.id },
  });

  if (!adminEntry) {
    console.log("Assigning admin role to user...");
    await assignAdminRoleToUser(adminUser.id);
    console.log("Admin role assigned.");
  } else {
    console.log("Admin role already exists for this user.");
  }
}

async function main() {
  await ensureAdminExists();
}

main()
  .catch((e) => {
    console.error("Error: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
