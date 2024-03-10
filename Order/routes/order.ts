import express from 'express';
import { createOrder,getOrderById,getOrders, getTotalByUser,getOrdersByCustomer,addCustomerToOrder,updateOrder } from '../controllers/order';
import authenticateJWT from '../middlewares/authenticateJWT';

const router = express.Router();
// Utilisez `authenticateJWT` comme middleware avant `createOrder`
router.post('/addcustomer/:id', authenticateJWT, addCustomerToOrder);
router.post('/',  authenticateJWT, createOrder);
router.get('/', authenticateJWT,getOrders);
router.get('/total/:userId', authenticateJWT,getTotalByUser);
router.get('/customer/:customerId', authenticateJWT,getOrdersByCustomer);
router.put('/:orderId',authenticateJWT, updateOrder);
router.get('/:id', authenticateJWT,getOrderById);

export default router;