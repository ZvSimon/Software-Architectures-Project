import express, { Router, Request, Response } from 'express';
import { getCustomerById,getAllCustomers } from '../controllers/customer';

const router: Router = express.Router();
router.get('/all', async (req: Request, res: Response) => {
  const customers = await getAllCustomers();
  res.json(customers);
}
);
router.get('/:customerId', async (req: Request, res: Response) => {
  const customerId = parseInt(req.params.customerId);
  const customer = await getCustomerById(customerId);
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ error: "Customer not found" });
  }
});

export default router;