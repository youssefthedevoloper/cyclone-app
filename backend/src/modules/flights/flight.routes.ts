import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { FlightService } from './flight.service';

const router = Router();
const service = new FlightService();

router.use(authenticate);

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ flight: service.getById(param(req.params.id)) });
  } catch (e) {
    next(e);
  }
});

router.get('/number/:number', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ flight: service.getByNumber(param(req.params.number)) });
  } catch (e) {
    next(e);
  }
});

router.get('/search/:origin/:destination/:date', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      flights: service.search(param(req.params.origin), param(req.params.destination), param(req.params.date)),
    });
  } catch (e) {
    next(e);
  }
});

export default router;