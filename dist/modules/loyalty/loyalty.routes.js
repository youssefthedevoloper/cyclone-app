"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const loyalty_service_1 = require("./loyalty.service");
const router = (0, express_1.Router)();
const service = new loyalty_service_1.LoyaltyService();
router.use(auth_1.authenticate);
router.get('/', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json({ balance: service.balance(userId), transactions: service.transactions(userId) });
    }
    catch (e) {
        next(e);
    }
});
router.get('/transactions', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json({ transactions: service.transactions(userId) });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=loyalty.routes.js.map