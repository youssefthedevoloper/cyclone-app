"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repo_1 = require("./user.repo");
const user_types_1 = require("./user.types");
const errors_1 = require("../../utils/errors");
const connection_1 = require("../../db/connection");
const config_1 = require("../../config");
class UserService {
    me(userId) {
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw (0, errors_1.unauthorized)('Account not found');
        const hasDemoAccess = user.account_number <= config_1.config.first20Count;
        const hasTicket = ticketCount(user.id) > 0;
        return (0, user_types_1.toPublicUser)(user, { hasTicket, hasDemoAccess });
    }
    async updateProfile(userId, patch) {
        const user = (0, user_repo_1.fetchUserById)(userId);
        if (!user)
            throw (0, errors_1.unauthorized)('Account not found');
        if (patch.name !== undefined) {
            if (!patch.name || !patch.name.trim())
                throw (0, errors_1.badRequest)('Name cannot be empty');
            (0, user_repo_1.updateUser)(userId, { name: patch.name.trim() });
        }
        return this.me(userId);
    }
}
exports.UserService = UserService;
function ticketCount(userId) {
    const db = (0, connection_1.getDb)();
    const r = db.prepare('SELECT COUNT(*) AS c FROM tickets WHERE user_id = ?').get(userId);
    return r.c;
}
//# sourceMappingURL=user.service.js.map