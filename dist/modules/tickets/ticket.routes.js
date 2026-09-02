"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const ticket_service_1 = require("./ticket.service");
const router = (0, express_1.Router)();
const service = new ticket_service_1.TicketService();
router.use(auth_1.authenticate);
router.post('/', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = service.add({ userId, ...(req.body || {}) });
        res.status(201).json({ ticket: result });
    }
    catch (e) {
        next(e);
    }
});
router.post('/demo', (req, res, next) => {
    try {
        const userId = req.user.userId;
        const accountNumber = req.user.accountNumber;
        if (!service.canAddDemo(userId, accountNumber)) {
            return res.status(403).json({ error: { code: 'forbidden', message: 'Demo tickets are only available for early accounts' } });
        }
        res.status(201).json({ ticket: service.addDemo(userId, accountNumber) });
    }
    catch (e) {
        next(e);
    }
});
router.get('/', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json({ tickets: service.list(userId) });
    }
    catch (e) {
        next(e);
    }
});
router.get('/:id', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json({ ticket: service.get(userId, (0, param_1.param)(req.params.id)) });
    }
    catch (e) {
        next(e);
    }
});
router.delete('/:id', (req, res, next) => {
    try {
        const userId = req.user.userId;
        res.json(service.remove(userId, (0, param_1.param)(req.params.id)));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map