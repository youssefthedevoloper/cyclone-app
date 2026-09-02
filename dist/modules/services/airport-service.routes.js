"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const airport_service_service_1 = require("./airport-service.service");
const router = (0, express_1.Router)();
const service = new airport_service_service_1.AirportServices();
router.use(auth_1.authenticate);
router.get('/', (req, res, next) => {
    try {
        res.json({ services: service.list(res.locals.user) });
    }
    catch (e) {
        next(e);
    }
});
router.post('/:id/use', (req, res, next) => {
    try {
        res.status(201).json(service.use(req.user.userId, (0, param_1.param)(req.params.id)));
    }
    catch (e) {
        next(e);
    }
});
router.get('/history/mine', (req, res, next) => {
    try {
        res.json({ transactions: service.transactions(req.user.userId) });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=airport-service.routes.js.map