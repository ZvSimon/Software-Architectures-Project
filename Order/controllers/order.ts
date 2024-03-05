import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as qr from 'qrcode';
import axios from 'axios';
const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response,next:NextFunction) => {
  const { userId, orderItems, total, status, customerIds} = req.body;
  
  try {
     // Récupérez l'utilisateur et le client
     const user = await axios.get(`http://localhost:8080/api/user/${userId}`);
     // Vérifiez que l'utilisateur et le client existent
     if (!user.data) {
      res.status(400).json({ error: "User does not exist" });
      return;
    }
    const order = await prisma.order.create({
      data: {
        total: total,
        status: status,
        userId:userId,
        qrCodeData: "",
        orderItems: {
          create: orderItems.map((item: { quantity: number; price: number; productId: number }) => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId, // Utilisez productId au lieu de connecter un produit
          })),
        },
      },
    });
    if (!Array.isArray(customerIds)) {
      return res.status(400).json({ error: "customerIds must be an array" });
    }
    for (const customerId of customerIds) {
      for (const customerId of customerIds) {
        await prisma.orderCustomer.create({
          data: {
            orderId: order.id,
            customerId: customerId,
          },
        });
      }
      // Récupérez le client
      const customer = await axios.get(`http://localhost:8080/api/customer/${customerId}`);
      
      // Vérifiez que le client existe
      if (!customer.data) {
        res.status(400).json({ error: `Customer with id ${customerId} does not exist` });
        return;
      }

      await prisma.orderCustomer.create({
        data: {
          customerId,
          orderId: order.id,
        },
      });
    }
    const qrCodeData: string = await qr.toDataURL(`http://localhost:8080/api/orders/${order.id}`);

    // Mise à jour de la commande avec le QR code
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { qrCodeData },
    });

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Failed to create order: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrders = async (_: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
      },
    });

    const ordersWithCustomers = await Promise.all(
      orders.map(async (order) => {
        const orderCustomers = await prisma.orderCustomer.findMany({
          where: { orderId: order.id },
        });

        const customers = await Promise.all(
          orderCustomers.map((orderCustomer) =>
            axios.get(`http://localhost:8080/api/customer/${orderCustomer.customerId}`)
          )
        );

        return {
          ...order,
          customers: customers.map((response) => response.data),
        };
      })
    );

    res.status(200).json(ordersWithCustomers);
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

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderCustomers = await prisma.orderCustomer.findMany({
      where: { orderId: Number(id) },
    });

    const customers = await Promise.all(
      orderCustomers.map((orderCustomer) =>
        axios.get(`http://localhost:8080/api/customer/${orderCustomer.customerId}`)
      )
    );

    // Ajoutez les données des clients à la commande
    const orderWithCustomers = {
      ...order,
      customers: customers.map((response) => response.data),
    };

    return res.status(200).json(orderWithCustomers);
  } catch (error) {
    console.error("Failed to get order: ", error);
    return res.status(500).json({ error: "Internal server error" });
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
export const getOrdersByCustomer = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  if (isNaN(Number(customerId))) {
    res.status(400).json({ error: "customerId must be a number" });
    return;
  }

  try {
    const orderCustomers = await prisma.orderCustomer.findMany({
      where: {
        customerId: Number(customerId),
      },
    });

    const orders = await Promise.all(
      orderCustomers.map((orderCustomer) =>
        prisma.order.findUnique({
          where: {
            id: orderCustomer.orderId,
          },
        })
      )
    );

    res.status(200).json({ customerId, orders });
  } catch (error) {
    console.error("Failed to get orders: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};