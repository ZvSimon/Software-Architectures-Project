import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const processPayment = async (req: Request, res: Response): Promise<void> => {
    const { customerId, amount } = req.body;
    
    try {
        const orders = await prisma.order.findMany({
            where: {
              status: "pending",
              customerId: Number(customerId), // Assurez-vous que customerId est un nombre
            },
          });
          
        

        if (orders.length === 0) {
            res.status(404).send('Aucune commande non payée trouvée pour cet utilisateur');
            return;
        }

        const total = orders.reduce((sum, order) => sum + order.total, 0);

        if (amount > total) {
            res.status(400).send('Le montant spécifié est supérieur au total des commandes non payées');
            return;
        }

        const payment = await prisma.payment.create({
            data: {
                customer: { connect: { id: Number(customerId) } },
                amount: amount,
                status: 'completed',
                method: 'carte',
            },
        });

        await Promise.all(orders.map(order => prisma.order.update({
            where: { id: order.id },
            data: { status: 'payé' },
        })));

        res.status(200).json({ message: 'Paiement effectué avec succès', payment });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log(String(error));
        }
    }
};