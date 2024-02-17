import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();
export async function getUserById(userId: number): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id: userId } });
  }