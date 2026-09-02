import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { AirportService } from './airport.service';

const router = Router();
const service = new AirportService();

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ airports: service.list() });
  } catch (e) {
    next(e);
  }
});

router.get('/locations', (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = param(req.query.code, 'CAI');
    res.json(service.getLocations(code));
  } catch (e) {
    next(e);
  }
});

router.get('/navigate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = param(req.query.code, 'CAI');
    const from = param(req.query.from, '');
    const to = param(req.query.to, '');
    res.json(service.navigate(code, from, to));
  } catch (e) {
    next(e);
  }
});

router.get('/:code', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ airport: service.getByCode(param(req.params.code)) });
  } catch (e) {
    next(e);
  }
});

router.get('/:code/map', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(service.getMap(param(req.params.code)));
  } catch (e) {
    next(e);
  }
});

export default router;