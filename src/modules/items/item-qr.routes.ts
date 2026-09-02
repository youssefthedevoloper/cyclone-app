import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../middleware/auth';
import { param } from '../../utils/param';
import { ItemService } from './item.service';
import { generateQrDataUrl, getLogoDataUrl } from '../../utils/qr';

const router = Router();
const service = new ItemService();

// QR verification is public-ish but requires auth; rate limited to prevent scanning abuse
const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many QR scans. Try again shortly.' } },
});

router.use(authenticate);

// Generate QR (visual) for an item
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

// Regenerate QR (rotates identifier, revoking previously printed codes)
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

// Verify a scanned/entered QR identifier
router.post('/verify', verifyLimiter, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json(service.verifyQr(userId, (req.body || {}).identifier));
  } catch (e) {
    next(e);
  }
});

// Report found (non-owner scans a lost item) - privacy-safe
router.post('/found', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json(service.reportFound(userId, (req.body || {}).identifier));
  } catch (e) {
    next(e);
  }
});

// Alias route under /qr (the structure had a /qr/verify too)
router.post('/verify-scan', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    res.json(service.verifyQr(userId, (req.body || {}).identifier));
  } catch (e) {
    next(e);
  }
});

export default router;