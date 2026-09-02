"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const reward_service_1 = require("./reward.service");
const router = (0, express_1.Router)();
const service = new reward_service_1.RewardsService();
router.use(auth_1.authenticate);
router.get('/', (req, res, next) => {
    try {
        res.json({ rewards: service.list(res.locals.user) });
    }
    catch (e) {
        next(e);
    }
});
router.post('/:id/redeem', (req, res, next) => {
    service
        .redeem(req.user.userId, (0, param_1.param)(req.params.id))
        .then((result) => res.json(result))
        .catch(next);
});
router.get('/history/mine', (req, res, next) => {
    try {
        res.json({ redemptions: service.history(req.user.userId) });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=reward.routes.js.map