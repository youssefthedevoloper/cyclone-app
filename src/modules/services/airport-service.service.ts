import { getDb } from '../../db/connection';
import { genId } from '../../utils/ids';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { NotificationService } from '../notifications/notification.service';
import { fetchUserById } from '../users/user.repo';
import { isPremium } from '../journey/journey.access';

export interface ServiceRow {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  points_reward: number;
  premium_required: number;
  available: number;
}

export class AirportServices {
  constructor(
    private loyalty = new LoyaltyService(),
    private notifications = new NotificationService()
  ) {}

  list(user: any) {
    const rows = getDb().prepare('SELECT * FROM services ORDER BY premium_required, points_reward').all() as ServiceRow[];
    const premium = isPremium(user);
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      price: s.price,
      pointsReward: s.points_reward,
      premiumRequired: !!s.premium_required,
      requiresPremium: !!s.premium_required && !premium,
      available: !!s.available,
      usable: !!s.available && (premium || !s.premium_required),
    }));
  }

  use(userId: string, serviceId: string) {
    const db = getDb();
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId) as ServiceRow | undefined;
    if (!service) throw notFound('Service not found');
    if (!service.available) throw conflict('This service is currently unavailable');
    const user = fetchUserById(userId);
    if (!user) throw badRequest('User not found');
    if (service.premium_required && !isPremium({ id: userId, premiumStatus: user.premium_status } as any)) {
      throw badRequest('This service requires Premium');
    }

    const txId = genId('stx');
    const amount = service.price ?? 0;
    db.prepare(
      `INSERT INTO service_transactions (id, user_id, service_id, amount, points_earned, status, unique_key, created_at)
       VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?)`
    ).run(txId, userId, serviceId, amount, service.points_reward, `svc-${userId}-${txId}`, new Date().toISOString());

    // loyalty loop
    const earned = this.loyalty.awardService(userId, service, txId);
    this.notifications.create(userId, 'Service confirmed', `Your ${service.name} has been confirmed. ${earned ? `+${service.points_reward} Cyclone Points earned.` : ''}`, 'service');

    const updated = fetchUserById(userId)!;
    return {
      success: true,
      serviceId: service.id,
      serviceName: service.name,
      amount,
      pointsEarned: service.points_reward,
      newBalance: updated.loyalty_points,
      transactionId: txId,
    };
  }

  transactions(userId: string) {
    const rows = getDb()
      .prepare(
        `SELECT t.*, s.name AS service_name FROM service_transactions t LEFT JOIN services s ON s.id = t.service_id WHERE t.user_id = ? ORDER BY t.created_at DESC`
      )
      .all(userId) as any[];
    return rows.map((t) => ({
      id: t.id,
      serviceId: t.service_id,
      serviceName: t.service_name,
      amount: t.amount,
      pointsEarned: t.points_earned,
      status: t.status,
      createdAt: t.created_at,
    }));
  }
}