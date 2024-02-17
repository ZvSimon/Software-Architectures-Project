import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Burger",
      description: "Juicy beef patty with lettuce, tomato, and cheese",
      price: 10.99,
    },
    {
      name: "Pizza",
      description: "Thin crust pizza with a variety of toppings",
      price: 12.99,
    },
    {
      name: "Salad",
      description: "Fresh greens with a choice of dressing",
      price: 8.99,
    },
    {
      name: "Pasta",
      description: "Al dente pasta with a choice of sauce",
      price: 11.99,
    },
    {
      name: "Steak",
      description: "Tender and juicy steak cooked to perfection",
      price: 19.99,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });