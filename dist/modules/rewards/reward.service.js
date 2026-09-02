"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsService = void 0;
const connection_1 = require("../../db/connection");
const ids_1 = require("../../utils/ids");
const errors_1 = require("../../utils/errors");
const loyalty_service_1 = require("../loyalty/loyalty.service");
const notification_service_1 = require("../notifications/notification.service");
const user_repo_1 = require("../users/user.repo");
const journey_access_1 = require("../journey/journey.access");
class RewardsService {
    constructor(loyalty = new loyalty_service_1.LoyaltyService(), notifications = new notification_service_1.NotificationService()) {
        this.loyalty = loyalty;
        this.notifications = notifications;
    }
    list(user) {
        const db = (0, connection_1.getDb)();
        const rows = db.prepare('SELECT * FROM rewards ORDER BY points_cost').all();
        const premium = (0, journey_access_1.isPremium)(user);
        return rows
            .filter((r) => r.available === 1)
            .map((r) => this.decorate(r, user, premium));
    }
    async redeem(userId, rewardId) {
        const db = (0, connection_1.getDb)();
        const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId);
        if (!reward)
            throw (0, errors_1.notFound)('Reward not found');
        if (!reward.available)
            throw (0, errors_1.conflict)('This reward is currently unavailable');
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw (0, errors_1.badRequest)('User not found');
        if (reward.premium_only && !(0, journey_access_1.isPremium)({ id: userId })) {
            throw (0, errors_1.badRequest)('This reward requires Premium');
        }
        if (reward.inventory <= 0)
            throw (0, errors_1.conflict)('This reward is sold out');
        if (user.loyalty_points < reward.points_cost) {
            throw (0, errors_1.conflict)('Not enough Cyclone Points.');
        }
        // idempotency check: single redemption transaction
        const tx = (0, connection_1.getDb)().transaction(() => {
            const fresh = (0, user_repo_1.fetchUserById)(userId);
            const freshReward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId);
            if (fresh.loyalty_points < freshReward.points_cost)
                throw (0, errors_1.conflict)('Not enough Cyclone Points.');
            if (freshReward.inventory <= 0)
                throw (0, errors_1.conflict)('This reward is sold out');
            const vt = this.loyalty.spend(userId, freshReward.points_cost, `Redeemed ${freshReward.title}`, rewardId);
            const voucherCode = (0, ids_1.genVoucherCode)();
            const redemptionId = (0, ids_1.genId)('rdm');
            db.prepare(`INSERT INTO reward_redemptions (id, user_id, reward_id, points_spent, status, voucher_code, created_at)
         VALUES (?, ?, ?, ?, 'redeemed', ?, ?)`).run(redemptionId, userId, rewardId, freshReward.points_cost, voucherCode, new Date().toISOString());
            db.prepare('UPDATE rewards SET inventory = inventory - 1 WHERE id = ?').run(rewardId);
            return { redemptionId, voucherCode, pointsCost: freshReward.points_cost };
        });
        const res = tx();
        this.notifications.create(userId, 'Reward redeemed', `You redeemed ${reward.title} for ${reward.points_cost} Cyclone Points.`, 'rewards');
        const updatedUser = (0, user_repo_1.fetchUserById)(userId);
        return {
            success: true,
            redemptionId: res.redemptionId,
            voucherCode: res.voucherCode,
            pointsSpent: res.pointsCost,
            newBalance: updatedUser.loyalty_points,
            rewardTitle: reward.title,
        };
    }
    history(userId) {
        const db = (0, connection_1.getDb)();
        const rows = db
            .prepare(`SELECT r.*, rw.title AS reward_title FROM reward_redemptions r LEFT JOIN rewards rw ON rw.id = r.reward_id WHERE r.user_id = ? ORDER BY r.created_at DESC`)
            .all(userId);
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
    decorate(r, user, premium) {
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
exports.RewardsService = RewardsService;
//# sourceMappingURL=reward.service.js.map