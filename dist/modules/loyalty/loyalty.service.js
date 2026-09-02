"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyService = void 0;
const connection_1 = require("../../db/connection");
const ids_1 = require("../../utils/ids");
const user_repo_1 = require("../users/user.repo");
const config_1 = require("../../config");
const errors_1 = require("../../utils/errors");
const notification_service_1 = require("../notifications/notification.service");
class LoyaltyService {
    constructor(notifications = new notification_service_1.NotificationService()) {
        this.notifications = notifications;
    }
    balance(userId) {
        const u = (0, user_repo_1.fetchUserById)(userId);
        return u ? u.loyalty_points : 0;
    }
    transactions(userId) {
        const db = (0, connection_1.getDb)();
        const rows = db
            .prepare('SELECT * FROM loyalty_transactions WHERE user_id = ? ORDER BY created_at DESC')
            .all(userId);
        return rows.map((r) => ({
            id: r.id,
            amount: r.amount,
            type: r.type,
            reason: r.reason,
            referenceId: r.reference_id,
            createdAt: r.created_at,
        }));
    }
    award(userId, amount, type, reason, opts = {}) {
        if (amount <= 0)
            throw (0, errors_1.badRequest)('Amount must be positive');
        const db = (0, connection_1.getDb)();
        if (opts.uniqueKey) {
            const dup = db.prepare('SELECT id FROM loyalty_transactions WHERE unique_key = ?').get(opts.uniqueKey);
            if (dup)
                return null; // idempotent: already awarded
        }
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw (0, errors_1.badRequest)('User not found');
        const tx = {
            id: (0, ids_1.genId)('lty'),
            user_id: userId,
            amount: type === 'spent' ? -Math.abs(amount) : Math.abs(amount),
            type,
            reason,
            reference_id: opts.referenceId || null,
            unique_key: opts.uniqueKey || null,
            created_at: new Date().toISOString(),
        };
        db.prepare(`INSERT INTO loyalty_transactions (id, user_id, amount, type, reason, reference_id, unique_key, created_at)
       VALUES (@id, @user_id, @amount, @type, @reason, @reference_id, @unique_key, @created_at)`).run(tx);
        const newBalance = user.loyalty_points + tx.amount;
        (0, user_repo_1.setLoyaltyPoints)(userId, newBalance);
        if (type === 'earned') {
            this.notifications.create(userId, 'Cyclone Points earned', `You earned +${Math.abs(amount)} Cyclone Points.`, 'loyalty');
        }
        return tx;
    }
    spend(userId, amount, reason, referenceId) {
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw (0, errors_1.badRequest)('User not found');
        if (user.loyalty_points < amount)
            throw (0, errors_1.conflict)('Not enough Cyclone Points.');
        const tx = { ...this.award(userId, amount, 'spent', reason, { referenceId }), reference_id: referenceId || null };
        return tx;
    }
    awardJourneyCompletion(userId, stepIndex) {
        return this.award(userId, config_1.LOYALTY_RULES.journeyCompletion, 'earned', 'Journey step completion', {
            referenceId: 'journey-step-' + stepIndex,
            uniqueKey: `journey-complete-${userId}-${stepIndex}`,
        });
    }
    awardAllStepsBonus(userId) {
        return this.award(userId, config_1.LOYALTY_RULES.allSteps, 'earned', 'Completed all Journey steps', {
            uniqueKey: `journey-all-${userId}`,
        });
    }
    awardItemRegistration(userId, itemId) {
        return this.award(userId, config_1.LOYALTY_RULES.registerItem, 'earned', 'Registered an item with CYCLONE QR', {
            referenceId: itemId,
            uniqueKey: `item-reg-${userId}-${itemId}`,
        });
    }
    awardService(userId, service, serviceTxId) {
        const pts = service.points_reward || 0;
        if (pts <= 0)
            return null;
        return this.award(userId, pts, 'earned', `${service.name} service`, {
            referenceId: serviceTxId,
            uniqueKey: `service-${userId}-${serviceTxId}`,
        });
    }
}
exports.LoyaltyService = LoyaltyService;
//# sourceMappingURL=loyalty.service.js.map