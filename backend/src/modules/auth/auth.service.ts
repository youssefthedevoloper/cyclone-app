import bcrypt from 'bcryptjs';
import { genId } from '../../utils/ids';
import { badRequest, unauthorized, conflict } from '../../utils/errors';
import {
  fetchUserByEmail,
  fetchUserById,
  nextAccountNumber,
  insertUser,
} from '../users/user.repo';
import { toPublicUser } from '../users/user.types';
import { config } from '../../config';
import { signToken } from '../../middleware/auth';
import { getDb } from '../../db/connection';
import { logger } from '../../utils/logger';

export class AuthService {
  async register(name: string, email: string, password: string) {
    if (!name || !email || !password) throw badRequest('Name, email and password are required');
    if (password.length < 6) throw badRequest('Password must be at least 6 characters');
    const existing = fetchUserByEmail(email);
    if (existing) throw conflict('An account with this email already exists');
    const accountNumber = nextAccountNumber();
    const hasDemoAccess = accountNumber <= config.first20Count;
    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const user = {
      id: genId('usr'),
      name,
      email,
      password_hash: hash,
      account_number: accountNumber,
      premium_status: 'free',
      premium_expires_at: null,
      loyalty_points: 0,
      is_demo: 0,
      created_at: now,
      updated_at: now,
    };
    insertUser(user);
    logger.info('User registered', { accountNumber, id: user.id });
    const token = signToken({ userId: user.id, accountNumber: user.account_number });
    const hasTicket = ticketCount(user.id) > 0;
    return { token, user: toPublicUser(user, { hasTicket, hasDemoAccess }) };
  }

  async login(email: string, password: string) {
    if (!email || !password) throw badRequest('Email and password are required');
    const user = fetchUserByEmail(email);
    if (!user) throw unauthorized('Invalid email or password');
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw unauthorized('Invalid email or password');
    const token = signToken({ userId: user.id, accountNumber: user.account_number });
    const hasDemoAccess = user.account_number <= config.first20Count;
    const hasTicket = ticketCount(user.id) > 0;
    logger.info('User logged in', { userId: user.id });
    return { token, user: toPublicUser(user, { hasTicket, hasDemoAccess }) };
  }

  me(userId: string) {
    const user = fetchUserById(userId);
    if (!user) throw unauthorized('Account not found');
    const hasDemoAccess = user.account_number <= config.first20Count;
    const hasTicket = ticketCount(user.id) > 0;
    return toPublicUser(user, { hasTicket, hasDemoAccess });
  }
}

function ticketCount(userId: string): number {
  const db = getDb();
  const r = db.prepare('SELECT COUNT(*) AS c FROM tickets WHERE user_id = ?').get(userId) as any;
  return r.c;
}
