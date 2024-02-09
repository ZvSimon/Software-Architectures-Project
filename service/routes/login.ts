import express, { Router } from 'express';
import { loginUser } from '../controllers/login';

const router: Router = express.Router();

router.post('/', loginUser);

export default router;