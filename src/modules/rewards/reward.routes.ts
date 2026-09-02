import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { RewardsService } from './reward.service';

const router = Router();
const service = new RewardsService();

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ rewards: service.list(res.locals.user) });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/redeem', (req: Request, res: Response, next: NextFunction) => {
  service
    .redeem((req as any).user.userId, param(req.params.id))
    .then((result) => res.json(result))
    .catch(next);
});

router.get('/history/mine', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ redemptions: service.history((req as any).user.userId) });
  } catch (e) {
    next(e);
  }
});

export default router;
