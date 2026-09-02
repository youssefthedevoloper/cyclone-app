import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { NotificationService } from './notification.service';

const router = Router();
const service = new NotificationService();

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json({ notifications: service.list(userId), unreadCount: service.unreadCount(userId) });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/read', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json(service.markRead(userId, param(req.params.id)));
  } catch (e) {
    next(e);
  }
});

router.post('/read-all', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json(service.markAllRead(userId));
  } catch (e) {
    next(e);
  }
});

export default router;
