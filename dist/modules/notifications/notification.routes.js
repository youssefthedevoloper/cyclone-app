"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const notification_service_1 = require("./notification.service");
const router = (0, express_1.Router)();
const service = new notification_service_1.NotificationService();
router.use(auth_1.authenticate);
router.get('/', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json({ notifications: service.list(userId), unreadCount: service.unreadCount(userId) });
    }
    catch (e) {
        next(e);
    }
});
router.post('/:id/read', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json(service.markRead(userId, (0, param_1.param)(req.params.id)));
    }
    catch (e) {
        next(e);
    }
});
router.post('/read-all', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json(service.markAllRead(userId));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map