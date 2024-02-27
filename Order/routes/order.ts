import express from 'express';
import { createOrder,getOrderById,getOrders, getTotalByUser,getOrdersByCustomer } from '../controllers/order';
import authenticateJWT from '../middlewares/authenticateJWT';
import { generateQRCodeMiddleware } from '../middlewares/qrCodeMiddleware';
import { getOrderDetailsFromQR } from '../controllers/order';
const router = express.Router();
// Utilisez `authenticateJWT` comme middleware avant `createOrder`
router.post('/',  authenticateJWT,generateQRCodeMiddleware, createOrder);
router.get('/', authenticateJWT,getOrders);
router.get('/:id', authenticateJWT,getOrderById);
router.get('/total/:userId', authenticateJWT,getTotalByUser);
router.get('/customer/:customerId', authenticateJWT,getOrdersByCustomer);
router.get('/:orderId', getOrderDetailsFromQR);
export default router;