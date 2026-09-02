"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const auth_service_1 = require("./auth.service");
const router = (0, express_1.Router)();
const service = new auth_service_1.AuthService();
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body || {};
        const result = await service.register(name, email, password);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        const result = await service.login(email, password);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
});
router.post('/logout', auth_1.authenticate, (req, res) => {
    // client discards token; JWT is stateless
    res.json({ success: true });
});
router.get('/me', auth_1.authenticate, (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json({ user: service.me(userId) });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map