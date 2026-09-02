import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { unauthorized } from '../utils/errors';
import { fetchUserById } from '../modules/users/user.repo';

export interface AuthPayload {
  userId: string;
  accountNumber: number;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

// Sets req.user with userId; also loads full user into res.locals.user
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(unauthorized('Authentication required'));
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    const user = fetchUserById(decoded.userId);
    if (!user) return next(unauthorized('Account no longer exists'));
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      accountNumber: user.account_number,
      premiumStatus: user.premium_status,
      loyaltyPoints: user.loyalty_points,
      isDemo: !!user.is_demo,
    };
    (req as any).user = { userId: user.id, accountNumber: user.account_number };
    res.locals.user = safeUser;
    next();
  } catch (e) {
    return next(unauthorized('Session expired or invalid'));
  }
}
