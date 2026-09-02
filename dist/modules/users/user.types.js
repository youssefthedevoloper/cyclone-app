"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicUser = toPublicUser;
function toPublicUser(u, extra) {
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        accountNumber: u.account_number,
        premiumStatus: u.premium_status,
        premiumExpiresAt: u.premium_expires_at,
        loyaltyPoints: u.loyalty_points,
        isDemo: !!u.is_demo,
        hasTicket: extra.hasTicket,
        hasDemoAccess: extra.hasDemoAccess,
        createdAt: u.created_at,
    };
}
//# sourceMappingURL=user.types.js.map