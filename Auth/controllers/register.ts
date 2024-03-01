import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { generateToken } from './login';

const prisma = new PrismaClient();

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password,shippingAddress} = req.body;

  try {
    const alreadyExistsUser: User | null = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (alreadyExistsUser) {
      res.status(409).json({
        message: 'User with the same email already exists!',
      });
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const newUser: User = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role:'Customer',
        customer: { 
          create: {
            shippingAddress:shippingAddress
          }
        }
      },
      include: {
        customer: true // Inclure les détails du client dans la réponse
      }
    });

    const token: string = generateToken(newUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Thank you for registering', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export { registerUser };
