import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { ItemService } from './item.service';
import { generateQrDataUrl, getLogoDataUrl } from '../../utils/qr';

const router = Router();
const service = new ItemService();

router.use(authenticate);

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.status(201).json(service.create(userId, req.body || {}));
  } catch (e) {
    next(e);
  }
});

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ items: service.list((req as any).user.userId) });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/qr', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const qr = service.qrForItem(userId, param(req.params.id));
    const dataUrl = await generateQrDataUrl(qr.identifier);
    res.json({
      itemId: qr.itemId,
      itemName: qr.itemName,
      identifier: qr.identifier,
      qrDataUrl: dataUrl,
      logoDataUrl: getLogoDataUrl(),
      rotated: qr.rotated,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/qr/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const qr = service.qrForItem(userId, param(req.params.id), true);
    const dataUrl = await generateQrDataUrl(qr.identifier);
    res.json({
      itemId: qr.itemId,
      itemName: qr.itemName,
      identifier: qr.identifier,
      qrDataUrl: dataUrl,
      logoDataUrl: getLogoDataUrl(),
      rotated: qr.rotated,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ item: service.get((req as any).user.userId, param(req.params.id)) });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ item: service.update((req as any).user.userId, param(req.params.id), req.body || {}) });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/lost', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ item: service.markLost((req as any).user.userId, param(req.params.id), req.body || {}) });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/recovered', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ item: service.markRecovered((req as any).user.userId, param(req.params.id)) });
  } catch (e) {
    next(e);
  }
});

export default router;
