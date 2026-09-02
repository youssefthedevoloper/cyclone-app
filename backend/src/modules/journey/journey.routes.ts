import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { JourneyService } from './journey.service';

const router = Router();
const service = new JourneyService();

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, accountNumber } = (req as any).user;
    res.json(service.getJourney(userId, accountNumber));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, accountNumber } = (req as any).user;
    res.json({ journey: service.getJourneyById(userId, param(req.params.id), accountNumber) });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/steps/:stepId/complete', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as any).user;
    res.json(service.completeStep(userId, param(req.params.id), param(req.params.stepId)));
  } catch (e) {
    next(e);
  }
});

export default router;
