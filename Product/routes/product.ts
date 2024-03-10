import express from 'express';
import { createProduct ,getProducts, getProductById,updateProduct,deleteProduct } from '../controllers/product';
import authenticateJWT from '../middlewares/authenticateJWT';
import { isAdmin } from '../middlewares/authenticateisAdmin';
const router = express.Router();
router.post('/', authenticateJWT,isAdmin, createProduct);
router.get('/', authenticateJWT,getProducts);
router.get('/:id', authenticateJWT,getProductById);
router.put('/:id',authenticateJWT,isAdmin,updateProduct);
router.delete('/:id',authenticateJWT,isAdmin,deleteProduct);

export default router;