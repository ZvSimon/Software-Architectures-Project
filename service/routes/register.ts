import express, { Router, Request, Response } from 'express';
import { registerUser } from '../controllers/register';

const router: Router = express.Router();

router.post('/', (req: Request, res: Response) => registerUser(req, res));

export default router;