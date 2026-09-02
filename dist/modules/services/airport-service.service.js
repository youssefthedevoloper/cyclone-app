"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirportServices = void 0;
const connection_1 = require("../../db/connection");
const ids_1 = require("../../utils/ids");
const errors_1 = require("../../utils/errors");
const loyalty_service_1 = require("../loyalty/loyalty.service");
const notification_service_1 = require("../notifications/notification.service");
const user_repo_1 = require("../users/user.repo");
const journey_access_1 = require("../journey/journey.access");
class AirportServices {
    constructor(loyalty = new loyalty_service_1.LoyaltyService(), notifications = new notification_service_1.NotificationService()) {
        this.loyalty = loyalty;
        this.notifications = notifications;
    }
    list(user) {
        const rows = (0, connection_1.getDb)().prepare('SELECT * FROM services ORDER BY premium_required, points_reward').all();
        const premium = (0, journey_access_1.isPremium)(user);
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
    use(userId, serviceId) {
        const db = (0, connection_1.getDb)();
        const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
        if (!service)
            throw (0, errors_1.notFound)('Service not found');
        if (!service.available)
            throw (0, errors_1.conflict)('This service is currently unavailable');
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw (0, errors_1.badRequest)('User not found');
        if (service.premium_required && !(0, journey_access_1.isPremium)({ id: userId, premiumStatus: user.premium_status })) {
            throw (0, errors_1.badRequest)('This service requires Premium');
        }
        const txId = (0, ids_1.genId)('stx');
        const amount = service.price ?? 0;
        db.prepare(`INSERT INTO service_transactions (id, user_id, service_id, amount, points_earned, status, unique_key, created_at)
       VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?)`).run(txId, userId, serviceId, amount, service.points_reward, `svc-${userId}-${txId}`, new Date().toISOString());
        // loyalty loop
        const earned = this.loyalty.awardService(userId, service, txId);
        this.notifications.create(userId, 'Service confirmed', `Your ${service.name} has been confirmed. ${earned ? `+${service.points_reward} Cyclone Points earned.` : ''}`, 'service');
        const updated = (0, user_repo_1.fetchUserById)(userId);
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
    transactions(userId) {
        const rows = (0, connection_1.getDb)()
            .prepare(`SELECT t.*, s.name AS service_name FROM service_transactions t LEFT JOIN services s ON s.id = t.service_id WHERE t.user_id = ? ORDER BY t.created_at DESC`)
            .all(userId);
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
exports.AirportServices = AirportServices;
//# sourceMappingURL=airport-service.service.js.map