import express, { Router, Request, Response } from 'express';
import { getUserById,getAllUsers } from '../controllers/user';

const router: Router = express.Router();
router.get('/all', async (req: Request, res: Response) => {
  const users = await getAllUsers();
  res.json(users);
}
);
router.get('/:userId', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const user = await getUserById(userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;