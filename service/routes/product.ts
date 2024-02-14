import express from 'express';
import { createProduct ,getProducts, getProductById } from '../controllers/product';
import authenticateJWT from '../middlewares/authenticateJWT';
const router = express.Router();
router.post('/', authenticateJWT,createProduct);
router.get('/:id', authenticateJWT,getProductById);
router.get('/', authenticateJWT,getProducts);

export default router;