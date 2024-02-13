import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
    const { userId, orderItems, total, status, customerId } = req.body;
  
    try {
      const order = await prisma.order.create({
        data: {
          total: total,
          status: status,
          userId: userId,
          customerId: customerId,
          orderItems: {
            create: orderItems.map((item: { quantity: number; price: number; productId: number }) => ({
              quantity: item.quantity,
              price: item.price,
              product: {
                connect: {
                  id: item.productId,
                },
              },
            })),
          },
        },
      });
  
      res.status(201).json(order);
    } catch (error) {
      console.error("Failed to create order: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to get orders: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        orderItems: true,
      },
    });

    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Failed to get order: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getTotalByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: Number(userId),
      },
    });

    const total = orders.reduce((sum, order) => sum + order.total, 0);

    res.status(200).json({ userId, total });
  } catch (error) {
    console.error("Failed to get total: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};