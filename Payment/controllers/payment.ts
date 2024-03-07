import { Request, Response } from 'express';
import axios from 'axios';
import { header } from 'express-validator';

export const processPayment = async (req: Request, res: Response): Promise<void> => {
  const { payments } = req.body; // payments est un tableau d'objets { orderId, amount, customerId }

  try {
    // Itérer sur chaque paiement pour traiter le paiement
    for (const payment of payments) {
      const { data: order } = await axios.get(`http://localhost:8082/api/orders/${payment.orderId}`, {
        headers: {
          Authorization: `Bearer ${req.headers.authorization}`
        }
      });
      
      // Vérifiez si la commande existe
      if (!order) {
        res.status(400).send(`Order with id ${payment.orderId} does not exist`);
        return;
      }

      // Vérifiez si le client est le propriétaire de la commande
      if (order.customerId !== payment.customerId) {
        res.status(403).send(`Customer with id ${payment.customerId} is not the owner of the order with id ${payment.orderId}`);
        return;
      }

      // Ajoutez le montant du paiement à totalPaid
      order.totalPaid += payment.amount;

      // Vérifiez si la commande a été entièrement payée
      if (order.totalPaid >= order.total) {
        // La commande a été entièrement payée
        // Mettez à jour le statut de la commande dans la base de données
        await axios.put(`http://localhost:8082/api/orders/${payment.orderId}`, {
          headers:{
            Authorization: `Bearer ${req.headers.authorization}`
          },
          status: 'PAID',
          totalPaid: order.totalPaid
        });
      }
    }
    res.status(200).send('Paiements traités avec succès');
  } catch (error) {
    res.status(500).send('Une erreur est survenue lors du traitement des paiements');
  }
};