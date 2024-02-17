
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const newOrder = await prisma.order.create({
    data: {
      total: 20.99,
      status: "pending",
      userId: 2,
      customerId: 1,
      orderItems: {
        create: [
          {
            quantity: 2,
            price: 10.99,
            productId: 1
          }
        ]
      }
    }
  });

  console.log(`Created new order: ${newOrder.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });