"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ids_1 = require("../../utils/ids");
const errors_1 = require("../../utils/errors");
const user_repo_1 = require("../users/user.repo");
const user_types_1 = require("../users/user.types");
const config_1 = require("../../config");
const auth_1 = require("../../middleware/auth");
const connection_1 = require("../../db/connection");
const logger_1 = require("../../utils/logger");
class AuthService {
    async register(name, email, password) {
        if (!name || !email || !password)
            throw (0, errors_1.badRequest)('Name, email and password are required');
        if (password.length < 6)
            throw (0, errors_1.badRequest)('Password must be at least 6 characters');
        const existing = (0, user_repo_1.fetchUserByEmail)(email);
        if (existing)
            throw (0, errors_1.conflict)('An account with this email already exists');
        const accountNumber = (0, user_repo_1.nextAccountNumber)();
        const hasDemoAccess = accountNumber <= config_1.config.first20Count;
        const hash = await bcryptjs_1.default.hash(password, 10);
        const now = new Date().toISOString();
        const user = {
            id: (0, ids_1.genId)('usr'),
            name,
            email,
            password_hash: hash,
            account_number: accountNumber,
            premium_status: 'free',
            premium_expires_at: null,
            loyalty_points: 0,
            is_demo: 0,
            created_at: now,
            updated_at: now,
        };
        (0, user_repo_1.insertUser)(user);
        logger_1.logger.info('User registered', { accountNumber, id: user.id });
        const token = (0, auth_1.signToken)({ userId: user.id, accountNumber: user.account_number });
        const hasTicket = ticketCount(user.id) > 0;
        return { token, user: (0, user_types_1.toPublicUser)(user, { hasTicket, hasDemoAccess }) };
    }
    async login(email, password) {
        if (!email || !password)
            throw (0, errors_1.badRequest)('Email and password are required');
        const user = (0, user_repo_1.fetchUserByEmail)(email);
        if (!user)
            throw (0, errors_1.unauthorized)('Invalid email or password');
        const ok = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!ok)
            throw (0, errors_1.unauthorized)('Invalid email or password');
        const token = (0, auth_1.signToken)({ userId: user.id, accountNumber: user.account_number });
        const hasDemoAccess = user.account_number <= config_1.config.first20Count;
        const hasTicket = ticketCount(user.id) > 0;
        logger_1.logger.info('User logged in', { userId: user.id });
        return { token, user: (0, user_types_1.toPublicUser)(user, { hasTicket, hasDemoAccess }) };
    }
    me(userId) {
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw (0, errors_1.unauthorized)('Account not found');
        const hasDemoAccess = user.account_number <= config_1.config.first20Count;
        const hasTicket = ticketCount(user.id) > 0;
        return (0, user_types_1.toPublicUser)(user, { hasTicket, hasDemoAccess });
    }
}
exports.AuthService = AuthService;
function ticketCount(userId) {
    const db = (0, connection_1.getDb)();
    const r = db.prepare('SELECT COUNT(*) AS c FROM tickets WHERE user_id = ?').get(userId);
    return r.c;
}
//# sourceMappingURL=auth.service.js.map