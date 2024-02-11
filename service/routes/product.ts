import express from 'express';
import { createProduct ,getProducts, getProductById } from '../controllers/product';

const router = express.Router();
router.post('/', createProduct);
router.get('/:id', getProductById);
router.get('/', getProducts);

export default router;