import express from 'express';
import { createProduct ,getProducts, getProductById } from '../controllers/product';
import authenticateJWT from '../middlewares/authenticateJWT';
import { isAdmin } from '../middlewares/authenticateisAdmin';
const router = express.Router();
router.post('/', authenticateJWT,isAdmin, createProduct);
router.get('/:id', authenticateJWT,getProductById);
router.get('/', authenticateJWT,getProducts);

export default router;