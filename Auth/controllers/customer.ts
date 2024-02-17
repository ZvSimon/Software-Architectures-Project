import { PrismaClient, Customer } from '@prisma/client';
const prisma = new PrismaClient();
export async function getCustomerById(CustomerById: number): Promise<Customer | null> {
    return await prisma.customer.findUnique({ where: { id: CustomerById } });
  }