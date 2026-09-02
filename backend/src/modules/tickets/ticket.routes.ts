import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { TicketService } from './ticket.service';

const router = Router();
const service = new TicketService();

router.use(authenticate);

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const result = service.add({ userId, ...(req.body || {}) });
    res.status(201).json({ ticket: result });
  } catch (e) {
    next(e);
  }
});

router.post('/demo', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const accountNumber = (req as any).user.accountNumber;
    if (!service.canAddDemo(userId, accountNumber)) {
      return res.status(403).json({ error: { code: 'forbidden', message: 'Demo tickets are only available for early accounts' } });
    }
    res.status(201).json({ ticket: service.addDemo(userId, accountNumber) });
  } catch (e) {
    next(e);
  }
});

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json({ tickets: service.list(userId) });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json({ ticket: service.get(userId, param(req.params.id)) });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json(service.remove(userId, param(req.params.id)));
  } catch (e) {
    next(e);
  }
});

export default router;