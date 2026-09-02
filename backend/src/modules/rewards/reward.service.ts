import { getDb } from '../../db/connection';
import { genId, genVoucherCode } from '../../utils/ids';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { NotificationService } from '../notifications/notification.service';
import { fetchUserById } from '../users/user.repo';
import { isPremium } from '../journey/journey.access';

export interface RewardRow {
  id: string;
  title: string;
  description: string;
  category: string;
  points_cost: number;
  available: number;
  premium_only: number;
  inventory: number;
}

export class RewardsService {
  constructor(
    private loyalty = new LoyaltyService(),
    private notifications = new NotificationService()
  ) {}

  list(user: any) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM rewards ORDER BY points_cost').all() as RewardRow[];
    const premium = isPremium(user);
    return rows
      .filter((r) => r.available === 1)
      .map((r) => this.decorate(r, user, premium));
  }

  async redeem(userId: string, rewardId: string) {
    const db = getDb();
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId) as RewardRow | undefined;
    if (!reward) throw notFound('Reward not found');
    if (!reward.available) throw conflict('This reward is currently unavailable');

    const user = fetchUserById(userId);
    if (!user) throw badRequest('User not found');
    if (reward.premium_only && !isPremium({ id: userId } as any)) {
      throw badRequest('This reward requires Premium');
    }
    if (reward.inventory <= 0) throw conflict('This reward is sold out');

    if (user.loyalty_points < reward.points_cost) {
      throw conflict('Not enough Cyclone Points.');
    }

    // idempotency check: single redemption transaction
    const tx = getDb().transaction(() => {
      const fresh = fetchUserById(userId)!;
      const freshReward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId) as RewardRow;
      if (fresh.loyalty_points < freshReward.points_cost) throw conflict('Not enough Cyclone Points.');
      if (freshReward.inventory <= 0) throw conflict('This reward is sold out');

      const vt = this.loyalty.spend(userId, freshReward.points_cost, `Redeemed ${freshReward.title}`, rewardId);
      const voucherCode = genVoucherCode();
      const redemptionId = genId('rdm');
      db.prepare(
        `INSERT INTO reward_redemptions (id, user_id, reward_id, points_spent, status, voucher_code, created_at)
         VALUES (?, ?, ?, ?, 'redeemed', ?, ?)`
      ).run(redemptionId, userId, rewardId, freshReward.points_cost, voucherCode, new Date().toISOString());
      db.prepare('UPDATE rewards SET inventory = inventory - 1 WHERE id = ?').run(rewardId);
      return { redemptionId, voucherCode, pointsCost: freshReward.points_cost };
    });

    const res = tx();
    this.notifications.create(userId, 'Reward redeemed', `You redeemed ${reward.title} for ${reward.points_cost} Cyclone Points.`, 'rewards');
    const updatedUser = fetchUserById(userId)!;
    return {
      success: true,
      redemptionId: res.redemptionId,
      voucherCode: res.voucherCode,
      pointsSpent: res.pointsCost,
      newBalance: updatedUser.loyalty_points,
      rewardTitle: reward.title,
    };
  }

  history(userId: string) {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT r.*, rw.title AS reward_title FROM reward_redemptions r LEFT JOIN rewards rw ON rw.id = r.reward_id WHERE r.user_id = ? ORDER BY r.created_at DESC`
      )
      .all(userId) as any[];
    return rows.map((r) => ({
      id: r.id,
      rewardId: r.reward_id,
      rewardTitle: r.reward_title,
      pointsSpent: r.points_spent,
      voucherCode: r.voucher_code,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  private decorate(r: RewardRow, user: any, premium: boolean) {
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      pointsCost: r.points_cost,
      available: !!r.available,
      premiumOnly: !!r.premium_only,
      inventory: r.inventory,
      requiresPremium: !!r.premium_only && !premium,
      redeemable: !!r.available && r.inventory > 0 && (premium || !r.premium_only) && user.loyalty_points >= r.points_cost,
      insufficientPoints: user.loyalty_points < r.points_cost,
    };
  }
}