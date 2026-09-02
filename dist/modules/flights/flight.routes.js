"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const param_1 = require("../../utils/param");
const flight_service_1 = require("./flight.service");
const router = (0, express_1.Router)();
const service = new flight_service_1.FlightService();
router.use(auth_1.authenticate);
router.get('/:id', (req, res, next) => {
    try {
        res.json({ flight: service.getById((0, param_1.param)(req.params.id)) });
    }
    catch (e) {
        next(e);
    }
});
router.get('/number/:number', (req, res, next) => {
    try {
        res.json({ flight: service.getByNumber((0, param_1.param)(req.params.number)) });
    }
    catch (e) {
        next(e);
    }
});
router.get('/search/:origin/:destination/:date', (req, res, next) => {
    try {
        res.json({
            flights: service.search((0, param_1.param)(req.params.origin), (0, param_1.param)(req.params.destination), (0, param_1.param)(req.params.date)),
        });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=flight.routes.js.map