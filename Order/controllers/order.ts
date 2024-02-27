import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { generateQRCodeMiddleware } from '../middlewares/qrCodeMiddleware';
const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response,next:NextFunction) => {
  const { userId, orderItems, total, status, customerId } = req.body;

  try {
     // Récupérez l'utilisateur et le client
     const user = await axios.get(`http://localhost:8080/api/user/${userId}`);
     const customer = await axios.get(`http://localhost:8080/api/customer/${customerId}`);
 
     // Vérifiez que l'utilisateur et le client existent
     if (!user.data || !customer.data) {
       res.status(400).json({ error: "User or customer does not exist" });
       return;
     }
     console.log(user.data);
     console.log(customer.data);  
     if (Number(user.data.id) != Number(customer.data.userId)){
      res.status(400).json({ error: "User and customer are not linked" });
      return;
    }
    // fonction conditionnelle qui me permet de dire si le userId ou CustomerId existe pas
    // if (Number(user.data.id))>
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
            productId: item.productId, // Utilisez productId au lieu de connecter un produit
          })),
        },
      },
    });
    const orderURL= `http://localhost:8082/api/order/${order.id}`;
    (req as any).qrCodeURL = orderURL;
    next();
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
export const getOrdersByCustomer = async (req: Request, res: Response) => {
  const { customerId } = req.params;
  if (isNaN(Number(customerId))) {
    res.status(400).json({ error: "customerId must be a number" });
    return;
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        customerId: Number(customerId),
      },
    });

    res.status(200).json({ customerId, orders });
  } catch (error) {
    console.error("Failed to get orders: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getOrderDetailsFromQR = async (req: Request, res: Response) => {
  try {
    // Récupérez l'ID de la commande à partir de la requête ou des paramètres de l'URL
    const orderId = req.params.orderId;

    // Recherchez la commande dans la base de données
    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId),
      },
      // Vous pouvez également inclure les détails des articles de commande si nécessaire
    });

    if (!order) {
      // Si la commande n'existe pas, renvoyez une erreur 404
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Renvoyer les détails de la commande à l'utilisateur
    res.status(200).json(order);
  } catch (error) {
    console.error("Failed to get order details from QR: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};