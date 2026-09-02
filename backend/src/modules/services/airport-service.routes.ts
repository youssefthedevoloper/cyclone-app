import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { AirportServices } from './airport-service.service';

const router = Router();
const service = new AirportServices();

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ services: service.list(res.locals.user) });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/use', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(service.use((req as any).user.userId, param(req.params.id)));
  } catch (e) {
    next(e);
  }
});

router.get('/history/mine', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ transactions: service.transactions((req as any).user.userId) });
  } catch (e) {
    next(e);
  }
});

export default router;
