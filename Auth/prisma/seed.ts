import { PrismaClient,User as UserType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createAdminUser(email: string, password: string): Promise<UserType> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: email,
      password: hashedPassword,
      role : "Admin"
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
async function createCustomerUser(firstName: string, lastName: string, email: string, password: string): Promise<UserType> {
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new Error(`User with email ${email} already exists`);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      role : "Customer"
    },
  });
}

async function assignCustomerRoleToUser(userId: number, shippingAddress: string){
  return prisma.customer.create({
    data: {
      userId: userId,
      shippingAddress: shippingAddress,
    },
  });
}

async function ensureCustomersExist() {
  const customer1Email = "Simon@example.come";
  const customer1Password = "customer123e"; // Utilize a more secure password in production
  const customer1 = await createCustomerUser("Simon", "One", customer1Email, customer1Password);
  await assignCustomerRoleToUser(customer1.id, "123 Main St, Springfield, IL");

  const customer2Email = "Elie2@examplee.com";
  const customer2Password = "customer123e"; // Utilize a more secure password in production
  const customer2 = await createCustomerUser("Elie", "Choukroun", customer2Email, customer2Password);
  await assignCustomerRoleToUser(customer2.id, "456 Elm St, Springfield, IL");
}

async function main() {
  console.log("Creating admin...");
  await ensureAdminExists();
  console.log("Admin created.");

  console.log("Creating customers...");
  await ensureCustomersExist();
  console.log("Customers created.");
}

main()
  .then(() => console.log("All tasks completed successfully."))
  .catch((e) => {
    console.error("Error: ", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Disconnecting from database...");
    await prisma.$disconnect();
    console.log("Disconnected.");
  });