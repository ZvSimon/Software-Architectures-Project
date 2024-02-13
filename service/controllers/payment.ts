import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const processPayment = async (req: Request, res: Response): Promise<void> => {
    const { customerId, amount, orderId } = req.body;
    
    try {
        const order = await prisma.order.findFirst({
            where: {
              status: "pending",
              customerId: Number(customerId),
              id: Number(orderId),
            },
        });

        if (!order) {
            res.status(404).send('La commande spécifiée n\'a pas été trouvée pour cet utilisateur');
            return;
        }

        if (order.total > amount) {
            res.status(400).send('Le montant spécifié est inférieur au total de la commande');
            return;
        }

        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'payé' },
        });

        const payment = await prisma.payment.create({
            data: {
                customer: { connect: { id: Number(customerId) } },
                
                amount: amount,
                status: 'completed',
                method: 'carte',
            },
        });

        res.status(200).json({ message: 'Paiement effectué avec succès', payment });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log(String(error));
        }
    }
};