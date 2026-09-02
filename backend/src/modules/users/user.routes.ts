import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { UserService } from './user.service';

const router = Router();
const service = new UserService();

router.use(authenticate);

router.get('/me', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json({ user: service.me(userId) });
  } catch (e) {
    next(e);
  }
});

router.patch('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { name } = req.body || {};
    res.json({ user: await service.updateProfile(userId, { name }) });
  } catch (e) {
    next(e);
  }
});

export default router;