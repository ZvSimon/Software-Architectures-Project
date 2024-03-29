import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
require('dotenv').config();
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import LoginRouter from './routes/login';
import RegisterRouter from './routes/register';
import UserRouter from './routes/user';
import CustomerRouter from './routes/customer';
const prisma = new PrismaClient();

const app: Application = express();
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use('/api/login', LoginRouter);
app.use('/api/register', RegisterRouter);
app.use('/api/user', UserRouter);
app.use('/api/customer', CustomerRouter);
const port: string | number = process.env.PORT || 8080;

// Connect to the database via Prisma Client
prisma
  .$connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening on: http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });

export default app;
