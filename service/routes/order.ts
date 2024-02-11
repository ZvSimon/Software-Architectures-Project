import express from 'express';
import { createOrder } from '../controllers/order';
import authenticateJWT from '../middlewares/authenticateJWT';

const router = express.Router();
// Utilisez `authenticateJWT` comme middleware avant `createOrder`
router.post('/',  authenticateJWT, createOrder);

export default router;