import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection';
import { forbidden } from '../utils/errors';
import { ApiError } from '../utils/errors';

export function requirePremium(_req: Request, res: Response, next: NextFunction) {
  try {
    const user = res.locals.user as any;
    if (!user) return next(forbidden('Authentication required'));
    if (user.premiumStatus && user.premiumStatus !== 'free') return next();
    const db = getDb();
    const ent = db
      .prepare(
        `SELECT COUNT(*) AS c FROM premium_entitlements WHERE user_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > ?)`
      )
      .get(user.id, new Date().toISOString()) as any;
    if (!ent.c || ent.c === 0) {
      return next(forbidden('Premium access required'));
    }
    next();
  } catch (e) {
    next(e);
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, 'Endpoint not found', 'not_found'));
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof ApiError ? err.message : 'Internal server error';
  const code = err instanceof ApiError ? err.code : 'internal_error';
  if (status >= 500) {
    console.error('[errorHandler]', err);
  } else {
    console.warn('[errorHandler]', status, message);
  }
  res.status(status).json({ error: { code, message } });
}
