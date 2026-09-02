import { fetchUserById, updateUser } from './user.repo';
import { toPublicUser } from './user.types';
import { unauthorized, badRequest } from '../../utils/errors';
import { getDb } from '../../db/connection';
import { config } from '../../config';

export class UserService {
  me(userId: string) {
    const user = fetchUserById(userId);
    if (!user) throw unauthorized('Account not found');
    const hasDemoAccess = user.account_number <= config.first20Count;
    const hasTicket = ticketCount(user.id) > 0;
    return toPublicUser(user, { hasTicket, hasDemoAccess });
  }

  async updateProfile(userId: string, patch: { name?: string }) {
    const user = fetchUserById(userId);
    if (!user) throw unauthorized('Account not found');
    if (patch.name !== undefined) {
      if (!patch.name || !patch.name.trim()) throw badRequest('Name cannot be empty');
      updateUser(userId, { name: patch.name.trim() });
    }
    return this.me(userId);
  }
}

function ticketCount(userId: string): number {
  const db = getDb();
  const r = db.prepare('SELECT COUNT(*) AS c FROM tickets WHERE user_id = ?').get(userId) as any;
  return r.c;
}