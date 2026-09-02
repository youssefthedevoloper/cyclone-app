"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumService = void 0;
const connection_1 = require("../../db/connection");
const ids_1 = require("../../utils/ids");
const errors_1 = require("../../utils/errors");
const user_repo_1 = require("../users/user.repo");
const journey_access_1 = require("../journey/journey.access");
class PremiumService {
    status(userId) {
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw new Error('User not found');
        const premium = (0, journey_access_1.isPremium)({ id: userId, premiumStatus: user.premium_status });
        const now = new Date().toISOString();
        const activeEntitlements = (0, connection_1.getDb)()
            .prepare(`SELECT * FROM premium_entitlements WHERE user_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > ?)`)
            .all(userId, now);
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
    activatePremium(userId, months = 1) {
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw (0, errors_1.badRequest)('User not found');
        if ((0, journey_access_1.isPremium)({ id: userId, premiumStatus: user.premium_status })) {
            throw (0, errors_1.badRequest)('You already have Premium');
        }
        const cost = PremiumService.PREMIUM_COST_POINTS * months;
        if (user.loyalty_points < cost) {
            throw (0, errors_1.badRequest)(`Premium costs ${cost} Cyclone Points. You have ${user.loyalty_points}.`);
        }
        const db = (0, connection_1.getDb)();
        const deduct = db.prepare('UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ?');
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
        const activate = () => db.prepare('UPDATE users SET premium_status = ?, premium_expires_at = ?, updated_at = ? WHERE id = ?');
        db.transaction(() => {
            deduct.run(cost, userId);
            activate().run('premium', expiresAt, now, userId);
        })();
        return this.status(userId);
    }
    activateEntitlement(userId, feature, months = 1) {
        const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
        (0, connection_1.getDb)()
            .prepare(`INSERT INTO premium_entitlements (id, user_id, feature, active, expires_at, created_at) VALUES (?, ?, ?, 1, ?, ?)`)
            .run((0, ids_1.genId)('ent'), userId, feature, expiresAt, new Date().toISOString());
        return this.status(userId);
    }
}
exports.PremiumService = PremiumService;
PremiumService.PREMIUM_COST_POINTS = 500;
//# sourceMappingURL=premium.service.js.map