"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePremium = requirePremium;
const connection_1 = require("../db/connection");
const errors_1 = require("../utils/errors");
function requirePremium(_req, res, next) {
    const user = res.locals.user;
    try {
        if (!user.premium_status || user.premium_status === 'free') {
            // allow entitlements-based premium
            const db = (0, connection_1.getDb)();
            const ent = db
                .prepare(`SELECT COUNT(*) AS c FROM premium_entitlements WHERE user_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > ?)`)
                .get(user.id, new Date().toISOString());
            if (!ent.c || ent.c === 0) {
                return next((0, errors_1.forbidden)('Premium access required'));
            }
        }
        next();
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=authorization.js.map