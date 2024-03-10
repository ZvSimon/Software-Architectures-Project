import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
require('dotenv').config();
import axios from 'axios';
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const processPayment = async (req: Request, res: Response): Promise<void> => {
  const { payments } = req.body; // payments is an array of objects { orderId, amount, customerId }
  console.log('Processing payments:', payments);
  try {
    // Iterate over each payment to process the payment
    for (const payment of payments) {
      console.log('Processing payment:', payment);
      const authHeader = req.headers.authorization;
if (!authHeader) {
  console.log('No authorization header');
  res.status(401).send('Unauthorized');
  return;
}
const { data: order } = await axios.get(`http://localhost:8082/api/orders/${payment.orderId}`, {
  headers: {
    Authorization: `Bearer ${authHeader.split(' ')[1]}`
  },
  maxRedirects: 0
});
      
      console.log('Fetched order:', order);
      // Check if the order exists
      if (!order) {
        console.log(`Order with id ${payment.orderId} does not exist`);
        res.status(400).send(`Order with id ${payment.orderId} does not exist`);
        return;
      }
      const orders = await axios.get(`http://localhost:8082/api/orders`, {
  headers: {
    Authorization: `Bearer ${authHeader.split(' ')[1]}`
  },
  maxRedirects: 0
});

// Loop through all orders
for (let order of orders.data) {
  // If the order status is 'Paid', delete the order
  if (order.status === 'Paid') {
    try {
      await axios.delete(`http://localhost:8082/api/orders/${order.id}`, { // Use order.id instead of payment.orderId
        headers: {
          Authorization: `Bearer ${authHeader.split(' ')[1]}`
        },
        maxRedirects: 0
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).send('Error deleting order');
      return; // Exit the function if an error occurs
    }
  }
}

      // Check if the customer is the owner of the order
      const isCustomerAssociatedWithOrder = order.customers.some((customer: { id: any; }) => customer.id === payment.customerId);
      if (!isCustomerAssociatedWithOrder) {
        console.log(`Customer with id ${payment.customerId} is not associated with the order with id ${payment.orderId}`);
        res.status(403).send(`Customer with id ${payment.customerId} is not associated with the order with id ${payment.orderId}`);
        return;
      }
      // Check if order.totalPaid and payment.amount are not null or undefined
      // Check if order.total and payment.amount are not null or undefined
if (order.total == null || payment.amount == null) {
  console.log('order.total or payment.amount is null or undefined');
  res.status(400).send('order.total or payment.amount is null or undefined');
  return;
}

// Calculate the new total after this payment
const newTotal = order.total - payment.amount;

// Prepare the data to update the order status if fully paid
const updateData = {
  status: newTotal === 0 ? 'Paid' : 'Pending',
  total: newTotal,
};

// Update the order in the database
await axios.put(`http://localhost:8082/api/orders/${payment.orderId}`, updateData, {
  headers: {
    Authorization: `Bearer ${authHeader.split(' ')[1]}`
  },
  maxRedirects: 0
});
const paymentData = {
  orderId: payment.orderId,
  amount: payment.amount,
  customerId: payment.customerId,
  status: 'completed', // Replace with the actual status
  method: 'credit_card', // Replace with the actual method
};
try {
  await prisma.payment.create({
    data: paymentData,
  });

  // Récupérez l'adresse e-mail du client à partir de la base de données
  const response = await axios.get(`http://localhost:3000/api/customer/${payment.customerId}`);

  const customer = response.data;
  if (!customer) {
    console.log(`Customer with id ${payment.customerId} does not exist`);
    return;
  }

  // Définissez les options de l'e-mail
  const mailOptions = {
    from: '"Votre Nom ou Société" <votre.email@exemple.com>', // adresse de l'expéditeur
    to: customer.email, // adresse e-mail du client
    subject: "Confirmation de paiement", // Sujet
    text: "Votre paiement a été traité avec succès.", // corps de l'email en texte brut
    html: "<b>Votre paiement a été traité avec succès.</b>" // corps de l'email en HTML
  };
  
  // Envoyez l'email
  transporter.sendMail(mailOptions, (error: Error | null, info: { messageId: string }) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message envoyé: %s', info.messageId);
  });
} catch (error) {
  console.error('Error inserting payment:', error);
  res.status(500).send('Error inserting payment');
  return; // Exit the function if an error occurs
}

      
    }
    res.status(200).send('Payments processed successfully');
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).send('Error fetching order');
    return; // Sort de la boucle si une erreur se produit
  }
}
