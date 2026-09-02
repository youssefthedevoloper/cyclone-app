import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { AuthService } from './auth.service';
import { ApiError } from '../../utils/errors';

const router = Router();
const service = new AuthService();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const result = await service.register(name, email, password);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const result = await service.login(email, password);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/logout', authenticate, (req, res) => {
  // client discards token; JWT is stateless
  res.json({ success: true });
});

router.get('/me', authenticate, (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    res.json({ user: service.me(userId) });
  } catch (e) {
    next(e);
  }
});

export default router;