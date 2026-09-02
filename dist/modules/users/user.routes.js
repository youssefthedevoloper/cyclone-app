"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const user_service_1 = require("./user.service");
const router = (0, express_1.Router)();
const service = new user_service_1.UserService();
router.use(auth_1.authenticate);
router.get('/me', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json({ user: service.me(userId) });
    }
    catch (e) {
        next(e);
    }
});
router.patch('/me', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { name } = req.body || {};
        res.json({ user: await service.updateProfile(userId, { name }) });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map