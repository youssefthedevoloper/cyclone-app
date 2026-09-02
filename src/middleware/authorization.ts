import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection';
import { forbidden } from '../utils/errors';
import { fetchUserById } from '../modules/users/user.repo';

export function requirePremium(_req: Request, res: Response, next: NextFunction) {
  const user = (res.locals.user as any);
  try {
    if (!user.premium_status || user.premium_status === 'free') {
      // allow entitlements-based premium
      const db = getDb();
      const ent = db
        .prepare(`SELECT COUNT(*) AS c FROM premium_entitlements WHERE user_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > ?)`)
        .get(user.id, new Date().toISOString()) as any;
      if (!ent.c || ent.c === 0) {
        return next(forbidden('Premium access required'));
      }
    }
    next();
  } catch (e) {
    next(e);
  }
}
