import { Router, Request, Response } from 'express';
import { getDb } from '../../db/connection';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    getDb().prepare('SELECT 1').get();
    res.json({
      status: 'ok',
      server: 'running',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (e) {
    res.status(503).json({
      status: 'degraded',
      server: 'running',
      database: 'error',
      error: (e as Error).message,
    });
  }
});

export default router;