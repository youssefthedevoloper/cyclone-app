import { getDb } from '../../db/connection';
import { genId } from '../../utils/ids';
import { badRequest } from '../../utils/errors';
import { fetchUserById } from '../users/user.repo';
import { isPremium } from '../journey/journey.access';

export class PremiumService {
  static PREMIUM_COST_POINTS = 500;

  status(userId: string) {
    const user = fetchUserById(userId);
    if (!user) throw new Error('User not found');
    const premium = isPremium({ id: userId, premiumStatus: user.premium_status } as any);
    const now = new Date().toISOString();
    const activeEntitlements = getDb()
      .prepare(
        `SELECT * FROM premium_entitlements WHERE user_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > ?)`
      )
      .all(userId, now) as any[];
    return {
      premium,
      status: user.premium_status,
      expiresAt: user.premium_expires_at,
      entitlementCount: activeEntitlements.length,
      entitlements: activeEntitlements.map((e) => ({
        id: e.id,
        feature: e.feature,
        active: !!e.active,
        expiresAt: e.expires_at,
      })),
    };
  }

  activatePremium(userId: string, months = 1) {
    const user = fetchUserById(userId);
    if (!user) throw badRequest('User not found');
    if (isPremium({ id: userId, premiumStatus: user.premium_status } as any)) {
      throw badRequest('You already have Premium');
    }
    const cost = PremiumService.PREMIUM_COST_POINTS * months;
    if (user.loyalty_points < cost) {
      throw badRequest(`Premium costs ${cost} Cyclone Points. You have ${user.loyalty_points}.`);
    }
    const db = getDb();
    const deduct = db.prepare('UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ?');
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
    const activate = () =>
      db.prepare('UPDATE users SET premium_status = ?, premium_expires_at = ?, updated_at = ? WHERE id = ?');
    db.transaction(() => {
      deduct.run(cost, userId);
      activate().run('premium', expiresAt, now, userId);
    })();
    return this.status(userId);
  }

  activateEntitlement(userId: string, feature: string, months = 1) {
    const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
    getDb()
      .prepare(
        `INSERT INTO premium_entitlements (id, user_id, feature, active, expires_at, created_at) VALUES (?, ?, ?, 1, ?, ?)`
      )
      .run(genId('ent'), userId, feature, expiresAt, new Date().toISOString());
    return this.status(userId);
  }
}