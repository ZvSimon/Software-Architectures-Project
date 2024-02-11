import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

interface UserPayload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  shippingAddress: string;
}

const generateToken = (user: any): string => {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    shippingAddress: user.customer.shippingAddress || '',
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const userWithEmail: User | null = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithEmail === null) {
       res.status(400).json({ message: 'Email or password does not match!' });
       return;
    }

    const passwordMatch: boolean = await bcrypt.compare(password, userWithEmail.password);

    if (!passwordMatch) {
      res.status(400).json({ message: 'Email or password does not match!' });
      return;
    }
    
    const jwtToken: string = generateToken(userWithEmail);

    // Adjust cookie configuration based on environment
    const isProduction: boolean = process.env.NODE_ENV === 'production';
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.json({ message: 'Welcome Back!', token: jwtToken });
  } catch (err) {
    console.error('Error: ', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export { loginUser, generateToken };
