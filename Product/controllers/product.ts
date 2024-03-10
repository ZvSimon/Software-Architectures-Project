import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();
export const createProduct = async (req: Request, res: Response) => {
    const { name, description, price } = req.body;
  
    if (!name || !description || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      const product = await prisma.product.create({
        data: {
          name: name,
          description: description,
          price: price,
        },
      });
  
      res.status(201).json(product);
    } catch (error) {
      console.error("Failed to create product: ", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    console.error("Failed to get products: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error("Failed to get product: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: name,
        description: description,
        price: price,
      },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error("Failed to update product: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error("Failed to delete product: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};