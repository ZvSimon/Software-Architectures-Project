import { PrismaClient } from '@prisma/client';
import { Request as ExpressRequest , Response } from 'express';
import axios from 'axios';
interface Request extends ExpressRequest {
  token?: string;
}
const prisma = new PrismaClient();

export const processPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { customerId, amount, orderId } = req.body;
  if (!req.token) {
    res.status(401).send('Token non fourni');
    return;
  }

  // Vérifiez que req.token ne contient pas de caractères non valides
  if (!/^[\w-]*$/.test(req.token)) {
    res.status(400).send('Token contient des caractères non valides');
    return;
  }
  const token = req.token.replace(/\n/g, '');
  try {
    const { data: order } = await axios.get(
      `http://localhost:8082/api/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${req.token}`, // Assurez-vous que req.token contient un token d'authentification valide
        },
      }
    );

    if (!order) {
      res
        .status(404)
        .send("La commande spécifiée n'a pas été trouvée pour cet utilisateur");
      return;
    }

    if (order.total > amount) {
      res
        .status(400)
        .send('Le montant spécifié est inférieur au total de la commande');
      return;
    }

    await axios.put(`http://localhost:8082/api/orders/${orderId}`, {
      status: 'completed',
    });

    const payment = await prisma.payment.create({
      data: {
        customerId: Number(customerId),
        amount: amount,
        status: 'completed',
        method: 'carte',
        orderId: Number(orderId),
      },
    });
    console.log('Paiement effectué avec succès', payment);
    try {
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { orderId: Number(orderId) },
      });

      console.log('Payment updated:', updatedPayment);
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
    res.status(200).json({ message: 'Paiement effectué avec succès', payment });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log(String(error));
    }
  }
};
