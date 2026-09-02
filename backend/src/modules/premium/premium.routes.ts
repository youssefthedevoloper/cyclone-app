import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { PremiumService } from './premium.service';

const router = Router();
const service = new PremiumService();

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ premium: service.status((req as any).user.userId) });
  } catch (e) {
    next(e);
  }
});

router.get('/entitlements', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ entitlements: service.status((req as any).user.userId).entitlements });
  } catch (e) {
    next(e);
  }
});

router.post('/activate', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(service.activatePremium((req as any).user.userId, (req.body || {}).months || 1));
  } catch (e) {
    next(e);
  }
});

export default router;