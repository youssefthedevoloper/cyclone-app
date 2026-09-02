"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errors_1 = require("../utils/errors");
const user_repo_1 = require("../modules/users/user.repo");
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, {
        expiresIn: config_1.config.jwtExpiresIn,
    });
}
// Sets req.user with userId; also loads full user into res.locals.user
function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token)
        return next((0, errors_1.unauthorized)('Authentication required'));
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = (0, user_repo_1.fetchUserById)(decoded.userId);
        if (!user)
            return next((0, errors_1.unauthorized)('Account no longer exists'));
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            accountNumber: user.account_number,
            premiumStatus: user.premium_status,
            loyaltyPoints: user.loyalty_points,
            isDemo: !!user.is_demo,
        };
        req.user = { userId: user.id, accountNumber: user.account_number };
        res.locals.user = safeUser;
        next();
    }
    catch (e) {
        return next((0, errors_1.unauthorized)('Session expired or invalid'));
    }
}
//# sourceMappingURL=auth.js.map