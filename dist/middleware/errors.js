"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePremium = requirePremium;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const connection_1 = require("../db/connection");
const errors_1 = require("../utils/errors");
const errors_2 = require("../utils/errors");
function requirePremium(_req, res, next) {
    try {
        const user = res.locals.user;
        if (!user)
            return next((0, errors_1.forbidden)('Authentication required'));
        if (user.premiumStatus && user.premiumStatus !== 'free')
            return next();
        const db = (0, connection_1.getDb)();
        const ent = db
            .prepare(`SELECT COUNT(*) AS c FROM premium_entitlements WHERE user_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > ?)`)
            .get(user.id, new Date().toISOString());
        if (!ent.c || ent.c === 0) {
            return next((0, errors_1.forbidden)('Premium access required'));
        }
        next();
    }
    catch (e) {
        next(e);
    }
}
function notFoundHandler(_req, _res, next) {
    next(new errors_2.ApiError(404, 'Endpoint not found', 'not_found'));
}
function errorHandler(err, _req, res, _next) {
    const status = err instanceof errors_2.ApiError ? err.status : 500;
    const message = err instanceof errors_2.ApiError ? err.message : 'Internal server error';
    const code = err instanceof errors_2.ApiError ? err.code : 'internal_error';
    if (status >= 500) {
        console.error('[errorHandler]', err);
    }
    else {
        console.warn('[errorHandler]', status, message);
    }
    res.status(status).json({ error: { code, message } });
}
//# sourceMappingURL=errors.js.map