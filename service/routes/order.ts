import express from 'express';
import { createOrder,getOrderById,getOrders, getTotalByUser } from '../controllers/order';
import authenticateJWT from '../middlewares/authenticateJWT';

const router = express.Router();
// Utilisez `authenticateJWT` comme middleware avant `createOrder`
router.post('/',  authenticateJWT, createOrder);
router.get('/', authenticateJWT,getOrders);
router.get('/:id', authenticateJWT,getOrderById);
router.get('/total/:userId', authenticateJWT,getTotalByUser);

export default router;