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
            customerId:Number (customerId),
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
export const addCustomerToOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { customerId, qrcode } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: Number(id) } });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.qrCodeData !== qrcode) {
      return res.status(400).json({ error: `The provided qrcode does not match the order's qrcode` });
    }

    const customer = await axios.get(`http://localhost:8080/api/customer/${customerId}`);

    await prisma.orderCustomer.create({
      data: {
        orderId: order.id,
        customerId: customerId,
      },
    });

    res.status(200).json({ message: "Customer added to order" });
  } catch (error) {
    console.error("Failed to add customer to order: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateOrder = async (req: Request, res: Response): Promise<Response> => {
  const { orderId } = req.params;
  const { status, total } = req.body;
  if (total === null || total === undefined) {
    return res.status(400).send('Total cannot be null or undefined');
  }
  try {
    // Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status: status,
        total: total,
      },
    })

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).send('Error updating order');
  }
};
export const deleteOrder = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const orderId = Number(id);

  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    // Vérifiez si la commande existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Supprimez d'abord les entrées OrderItem liées à la commande pour éviter les erreurs de contrainte de clé étrangère
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    // Ensuite, supprimez les entrées OrderCustomer liées
    await prisma.orderCustomer.deleteMany({
      where: { orderId: orderId },
    });

    // Finalement, supprimez la commande
    await prisma.order.delete({
      where: { id: orderId },
    });

    return res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    // Gérez les erreurs spécifiques liées aux contraintes de clé étrangère si nécessaire
    
    return res.status(500).json({ error: 'Error deleting order' });
  }
};
