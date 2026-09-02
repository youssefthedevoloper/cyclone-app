import { getDb } from '../../db/connection';
import { genId } from '../../utils/ids';
import { fetchUserById, setLoyaltyPoints } from '../users/user.repo';
import { LOYALTY_RULES } from '../../config';
import { conflict, badRequest } from '../../utils/errors';
import { NotificationService } from '../notifications/notification.service';

export interface LoyaltyTxRow {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  reason: string;
  reference_id: string | null;
  unique_key: string | null;
  created_at: string;
}

export class LoyaltyService {
  constructor(private notifications = new NotificationService()) {}

  balance(userId: string): number {
    const u = fetchUserById(userId);
    return u ? u.loyalty_points : 0;
  }

  transactions(userId: string) {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM loyalty_transactions WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as LoyaltyTxRow[];
    return rows.map((r) => ({
      id: r.id,
      amount: r.amount,
      type: r.type,
      reason: r.reason,
      referenceId: r.reference_id,
      createdAt: r.created_at,
    }));
  }

  award(userId: string, amount: number, type: 'earned' | 'spent' | 'adjustment', reason: string, opts: { referenceId?: string; uniqueKey?: string } = {}) {
    if (amount <= 0) throw badRequest('Amount must be positive');
    const db = getDb();
    if (opts.uniqueKey) {
      const dup = db.prepare('SELECT id FROM loyalty_transactions WHERE unique_key = ?').get(opts.uniqueKey);
      if (dup) return null; // idempotent: already awarded
    }
    const user = fetchUserById(userId);
    if (!user) throw badRequest('User not found');
    const tx: LoyaltyTxRow = {
      id: genId('lty'),
      user_id: userId,
      amount: type === 'spent' ? -Math.abs(amount) : Math.abs(amount),
      type,
      reason,
      reference_id: opts.referenceId || null,
      unique_key: opts.uniqueKey || null,
      created_at: new Date().toISOString(),
    };
    db.prepare(
      `INSERT INTO loyalty_transactions (id, user_id, amount, type, reason, reference_id, unique_key, created_at)
       VALUES (@id, @user_id, @amount, @type, @reason, @reference_id, @unique_key, @created_at)`
    ).run(tx);
    const newBalance = user.loyalty_points + tx.amount;
    setLoyaltyPoints(userId, newBalance);
    if (type === 'earned') {
      this.notifications.create(userId, 'Cyclone Points earned', `You earned +${Math.abs(amount)} Cyclone Points.`, 'loyalty');
    }
    return tx;
  }

  spend(userId: string, amount: number, reason: string, referenceId?: string) {
    const user = fetchUserById(userId);
    if (!user) throw badRequest('User not found');
    if (user.loyalty_points < amount) throw conflict('Not enough Cyclone Points.');
    const tx = { ...this.award(userId, amount, 'spent', reason, { referenceId }), reference_id: referenceId || null };
    return tx;
  }

  awardJourneyCompletion(userId: string, stepIndex: number) {
    return this.award(userId, LOYALTY_RULES.journeyCompletion, 'earned', 'Journey step completion', {
      referenceId: 'journey-step-' + stepIndex,
      uniqueKey: `journey-complete-${userId}-${stepIndex}`,
    });
  }

  awardAllStepsBonus(userId: string) {
    return this.award(userId, LOYALTY_RULES.allSteps, 'earned', 'Completed all Journey steps', {
      uniqueKey: `journey-all-${userId}`,
    });
  }

  awardItemRegistration(userId: string, itemId: string) {
    return this.award(userId, LOYALTY_RULES.registerItem, 'earned', 'Registered an item with CYCLONE QR', {
      referenceId: itemId,
      uniqueKey: `item-reg-${userId}-${itemId}`,
    });
  }

  awardService(userId: string, service: any, serviceTxId: string) {
    const pts = service.points_reward || 0;
    if (pts <= 0) return null;
    return this.award(userId, pts, 'earned', `${service.name} service`, {
      referenceId: serviceTxId,
      uniqueKey: `service-${userId}-${serviceTxId}`,
    });
  }
}