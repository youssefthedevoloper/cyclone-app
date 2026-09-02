"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const premium_service_1 = require("./premium.service");
const router = (0, express_1.Router)();
const service = new premium_service_1.PremiumService();
router.use(auth_1.authenticate);
router.get('/', (req, res, next) => {
    try {
        res.json({ premium: service.status(req.user.userId) });
    }
    catch (e) {
        next(e);
    }
});
router.get('/entitlements', (req, res, next) => {
    try {
        res.json({ entitlements: service.status(req.user.userId).entitlements });
    }
    catch (e) {
        next(e);
    }
});
router.post('/activate', (req, res, next) => {
    try {
        res.json(service.activatePremium(req.user.userId, (req.body || {}).months || 1));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=premium.routes.js.map