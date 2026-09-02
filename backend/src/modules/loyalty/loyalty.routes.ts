import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { LoyaltyService } from './loyalty.service';

const router = Router();
const service = new LoyaltyService();

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json({ balance: service.balance(userId), transactions: service.transactions(userId) });
  } catch (e) {
    next(e);
  }
});

router.get('/transactions', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json({ transactions: service.transactions(userId) });
  } catch (e) {
    next(e);
  }
});

export default router;