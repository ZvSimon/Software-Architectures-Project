// routes.ts
import express, { Router, Request, Response } from 'express';
import { processPayment } from '../controllers/payment';
import authenticateJWT from '../middlewares/authenticateJWT';
const router: Router = express.Router();

router.post('/',authenticateJWT, processPayment);

export default router;